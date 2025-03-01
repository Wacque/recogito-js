import {
  trimRange,
  rangeToSelection,
  enableTouch,
  getExactOverlaps,
} from "./SelectionUtils";
import EventEmitter from "tiny-emitter";

const IS_TOUCH = "ontouchstart" in window || navigator.maxTouchPoints > 0;

const IS_INTERNET_EXPLORER = navigator?.userAgent.match(/(MSIE|Trident)/);

/** Tests whether maybeChildEl is contained in containerEl **/
const contains = (containerEl, maybeChildEl) => {
  if (IS_INTERNET_EXPLORER) {
    // In IE, .contains returns false for text nodes
    // https://stackoverflow.com/questions/44140712/ie-acting-strange-with-node-contains-and-text-nodes
    if (maybeChildEl.nodeType == Node.TEXT_NODE)
      return (
        containerEl === maybeChildEl.parentNode ||
        containerEl.contains(maybeChildEl.parentNode)
      );
    else return containerEl.contains(maybeChildEl);
  } else {
    // Things can be so simple, unless you're in IE
    return containerEl.contains(maybeChildEl);
  }
};

export default class SelectionHandler extends EventEmitter {
  constructor(element, highlighter, readOnly) {
    super();

    this.el = element;
    this.highlighter = highlighter;
    this.readOnly = readOnly;

    this.isEnabled = true;

    this.document = element.ownerDocument;

    element.querySelectorAll(".r6o-annotation").forEach((el) => {
      el.addEventListener("click", (evt) => {
        const clickedElement = evt.target; // 获取被点击的元素
        console.log("clickedElement", clickedElement);
      });
    });

    element.addEventListener("click", this.clickHandler);
    // element.addEventListener("mouseup", this._onMouseUp);

    // if (IS_TOUCH) enableTouch(element, this._onMouseUp);
  }

  get enabled() {
    return this.isEnabled;
  }

  set enabled(enabled) {
    this.isEnabled = enabled;
  }

  _onMouseDown = (evt) => {
    // left click only
    if (evt.button === 0) this.clearSelection();
  };

  handleSelection() {
    const selection = this.document.getSelection();

    const selectedRange = trimRange(selection.getRangeAt(0));

    // Make sure the selection is entirely inside this.el
    const { commonAncestorContainer } = selectedRange;

    if (contains(this.el, commonAncestorContainer)) {
      const stub = rangeToSelection(selectedRange, this.el);

      const spans = this.highlighter.wrapRange(selectedRange);
      spans.forEach((span) => (span.className = "r6o-selection"));

      this._hideNativeSelection();

      const exactOverlaps = getExactOverlaps(stub, spans);
      console.log("exactOverlaps", exactOverlaps);
      if (exactOverlaps.length > 0) {
        // User selected existing - reuse top-most original to avoid stratification
        const top = exactOverlaps[0];

        this.clearSelection();
        this.emit("select", {
          selection: top,
          element: this.document.querySelector(
            `.r6o-annotation[data-id="${top.id}"]`
          ),
        });
      } else {
        this.emit("select", {
          selection: stub,
          element: selectedRange,
        });
      }
    }
  }

  clickHandler = (evt) => {
    if (this.isEnabled) {
      const selection = this.document.getSelection();
      // console.log("selection.isCollapsed", selection.isCollapsed);
      if (selection.isCollapsed) {
        const annotationSpan = evt.target.closest(".r6o-annotation");
        console.log("annotationSpan", annotationSpan);
        if (annotationSpan) {
          console.log(
            "this.highlighter.getAnnotationsAt(annotationSpan)[0]",
            this.highlighter.getAnnotationsAt(annotationSpan)[0]
          );
          this.emit("select", {
            selection: this.highlighter.getAnnotationsAt(annotationSpan)[0],
            element: annotationSpan,
          });
        } else {
          // De-select
          this.emit("select", {});
          this.clearSelection();
        }
      } else if (!this.readOnly) {
        // this.handleSelection();
      }
    }
  };

  _hideNativeSelection = () => {
    this.el.classList.add("r6o-hide-selection");
  };

  clearSelection = () => {
    if (this.isEnabled) {
      this._currentSelection = null;

      // Remove native selection, if any
      if (this.document.getSelection) {
        if (this.document.getSelection().empty) {
          // Chrome
          this.document.getSelection().empty();
        } else if (this.document.getSelection().removeAllRanges) {
          // Firefox
          this.document.getSelection().removeAllRanges();
        }
      } else if (this.document.selection) {
        // IE?
        this.document.selection.empty();
      }

      this.el.classList.remove("r6o-hide-selection");

      const spans = Array.prototype.slice.call(
        this.el.querySelectorAll(".r6o-selection")
      );
      if (spans) {
        spans.forEach((span) => {
          const parent = span.parentNode;
          parent.insertBefore(
            this.document.createTextNode(span.textContent),
            span
          );
          parent.removeChild(span);
        });
      }
      this.el.normalize();
    }
  };
}
