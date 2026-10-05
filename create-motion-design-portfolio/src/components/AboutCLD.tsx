import { memo, useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";

interface AboutCLDProps {
  open: boolean;
  onClose: () => void;
}

export default memo(function AboutCLD({ open, onClose }: AboutCLDProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="about-dialog"
      aria-labelledby="about-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="about-content">
        <div className="about-topline">
          <span className="mono">A QUICK INTRODUCTION</span>
          <button type="button" className="close-button" onClick={onClose} aria-label="关闭说明">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <h2 id="about-title">理解因果回路。</h2>
        <p className="about-intro">
          因果回路图（Causal Loop Diagram，CLD）用有方向的关系，
          描绘系统中的变量如何相互影响，并形成反馈。
        </p>
        <div className="polarity-explanation">
          <span className="explanation-sign">+</span>
          <div>
            <h3>同向关系</h3>
            <p>一个变量增加，另一个也趋于增加；一个减少，另一个也趋于减少。正号不代表“好”。</p>
          </div>
        </div>
        <div className="polarity-explanation">
          <span className="explanation-sign">-</span>
          <div>
            <h3>反向关系</h3>
            <p>一个变量增加，另一个趋于减少，反之亦然。负号不代表“坏”。</p>
          </div>
        </div>
        <p className="about-note">
          平衡模式下，四张卡片成对随机翻转，并始终保持奇数个负号，不会出现全正或全负。
          切换到增强模式时，所有负号都会翻转为正号。
          立方体翻转只改变展示内容，不改变连线方向。
        </p>
        <button type="button" className="about-return" onClick={onClose}>
          回到回路 <ArrowUpRight size={17} />
        </button>
      </div>
    </dialog>
  );
});