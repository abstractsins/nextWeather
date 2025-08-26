
import { DataCardLesserProps } from "@/types/types";
import { getUnitLabel } from "@/utils/utils";

export default function DataCardLesser({ id, title, className, data, data2 }: DataCardLesserProps) {

    return (
        <>
            <div id={id} className={className}>
                <span className={'data-label'}>{title}</span>
                <span className={'data-value-big'}>{data}<span className={`data-label-small ${id === 'temp' && 'degree'}`}>{getUnitLabel(id)}</span></span>
                <span className={'data-description'}>{data2}</span>
            </div>
        </>
    );
}