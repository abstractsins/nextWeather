import { DataCardHeroProps } from "@/types/types";
import { getUnitLabel } from "@/utils/utils";

export default function DataCardBasic({ id, className, title, data }: DataCardHeroProps) {

    const processedData = typeof data === 'number' ? Math.round(data) : data;

    return (
        <div id={id} className={className}>
            <span className={'data-label'}>{title}</span>
            <span className={'data-value-big'}>{processedData}<span className={`data-label-small ${id === 'temp' && 'degree'}`}>{getUnitLabel(id)}</span></span>
        </div>
    );
}