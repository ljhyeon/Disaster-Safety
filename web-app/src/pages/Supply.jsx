import { useState } from "react";

import { Item } from "../components/Item"

import { demandData } from "../dummydata/DemandData"
import { InfoDialog } from "../components/InfoDialog"
import { CheckDialog } from "../components/CheckDialog";

const info = {
        shelter: '땡땡대피소',
        address: '대구광역시 어디어디 어디어디',
        item: '생수',
        quantity: '50'
    }

export function Supply() {

    const [open, setOpen] = useState(false);
    const [checkOpen, setCheckOpen] = useState(false);

    const handleSubmit = () => {
        console.log('전송');
        setOpen(false);
        setCheckOpen(true);
    }

    const infoDialogOpen = () => {
        setOpen(true);
    }

    return (
        <>
            {
                demandData.map(({ title, description, location }, idx) => (
                    <Item
                        title={title}
                        description={description}
                        location={location}
                        onClick={infoDialogOpen}
                        key={idx}
                    />
                ))
            }
            <InfoDialog
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleSubmit}
                title="요청 상세 정보"
                shelter={info.shelter}
                address={info.address}
                item={info.item}
                quantity={info.quantity}
            />
            <CheckDialog 
                open={checkOpen}
                onClose={() => setCheckOpen(false)}
            />
        </>
    )
}