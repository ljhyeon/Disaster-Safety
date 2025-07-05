import { useState } from "react";
import { Item } from "../components/Item"
import { Form2Dialog } from "../components/Form2Dialog";
import { useShelterStore } from "../store/shelterStore";

export function Status() {

    const [open, setOpen] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    
    const { donationList, updateDonation } = useShelterStore();
    
    const handleSubmit = (values) => {
        console.log('송장 내용:', values);
        
        if (selectedDonation) {
            // 기부 정보 업데이트 (송장 번호 등록)
            updateDonation(selectedDonation.id, {
                courierCompany: values.label1, // 택배사명
                trackingNumber: values.label2, // 송장번호
                status: 'shipped' // 배송 상태로 변경
            });
        }
        
        setOpen(false);
    };

    const handleButtonClick = (donation) => {
        setSelectedDonation(donation);
        setOpen(true);
    };

    return (
        <>
            {
                donationList.map((donation, idx) => (
                    <Item
                        title={donation.item}
                        description={`${donation.shelterName}에 기부하기로 한 ${donation.item} ${donation.quantity}개`}
                        location={donation.shelterName}
                        showButton={true}
                        buttonLabel={donation.trackingNumber ? '송장 번호 수정' : '송장 번호 등록'}
                        onButtonClick={() => handleButtonClick(donation)}
                        key={idx}
                    />
                ))
            }

            {donationList.length === 0 && (
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#666',
                    fontSize: '14px'
                }}>
                    아직 기부하기로 한 물품이 없습니다.
                </div>
            )}

            <Form2Dialog
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleSubmit}
                label1="택배사명"
                label2="송장번호"
                commnet="송장번호를 입력해주세요"
            />
        </>
    )
}