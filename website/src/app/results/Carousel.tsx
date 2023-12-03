import { ReactNode } from 'react';

type CarouselParams = {
  index: number;
  setIndex?: (index: number) => void;
  children?: ReactNode[];
};

export const Carousel = ({ index, setIndex, children }: CarouselParams) => {
  return (
    <div
      className="duration-300 transition-transform flex inline-block relative h-[70vh] w-[70vh]"
      style={{ transform: `translateX(calc(${index} * -70vh))` }}
    >
      {children?.map((child, i) => (
        <SlideFrame onClick={() => setIndex?.(i)} key={i}>
          {child}
        </SlideFrame>
      ))}
    </div>
  );
};

type SlideFrameParams = {
  children?: ReactNode;
  onClick?: () => void;
};

const SlideFrame = ({ children, onClick }: SlideFrameParams) => {
  return (
    <div onClick={onClick} className="p-6 flex-none h-[70vh] w-[70vh]">
      <div className="w-full h-full rounded-3xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};
