import { useState } from "react";
import { Item } from "../components/Item"

import { statusData } from "../dummydata/StatusData"
import { Form2Dialog } from "../components/Form2Dialog";

export function Status() {

    const [open, setOpen] = useState(false);
    
    const handleSubmit = (values) => {
        console.log('송장 내용:', values);
    };

    return (
        <>
            {
                statusData.map(({ title, description, location }, idx) => (
                    <Item
                        title={title}
                        description={description}
                        location={location}
                        showButton={true}
                        buttonLabel='송장 번호 등록'
                        onButtonClick={() => setOpen(true)}
                        key={idx}
                    />
                ))
            }

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