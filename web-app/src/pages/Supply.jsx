import { useState } from "react";

import { Item } from "../components/Item"
import { InfoDialog } from "../components/InfoDialog"
import { CheckDialog } from "../components/CheckDialog";

import { demandData } from "../dummydata/DemandData";

import { useShelterStore } from "../store/shelterStore";

export function Supply() {

    const [open, setOpen] = useState(false);
    const [checkOpen, setCheckOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const { shelterId, shelterName, shelterAddress, addDonation } = useShelterStore();

    const handleSubmit = () => {
        if (selectedItem) {
            // 기부 정보를 store에 저장
            const donationInfo = {
                shelterId: shelterId,
                shelterName: shelterName,
                shelterAddress: shelterAddress,
                item: selectedItem.title,
                quantity: selectedItem.quantity,
                description: selectedItem.description,
                donatedAt: new Date().toISOString()
            };
            
            addDonation(donationInfo);
            console.log('기부 정보 저장:', donationInfo);
        }
        
        setOpen(false);
        setCheckOpen(true);
    }

    const infoDialogOpen = (item) => {
        setSelectedItem(item);
        setOpen(true);
    }

    return (
        <>
            {
                demandData.map((item, idx) => (
                    <Item
                        title={item.title}
                        description={item.description}
                        location={item.location}
                        onClick={() => infoDialogOpen(item)}
                        key={idx}
                    />
                ))
            }
            <InfoDialog
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleSubmit}
                title="요청 상세 정보"
                shelter={shelterName}
                address={shelterAddress}
                item={selectedItem?.title || ''}
                quantity={selectedItem?.quantity || ''}
            />
            <CheckDialog 
                open={checkOpen}
                onClose={() => setCheckOpen(false)}
            />
        </>
    )
}