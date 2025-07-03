import { Item } from "../components/Item"

import { demandData } from "../dummydata/DemandData"

export function Supply() {

    const infoDialogOpen = () => {
        console.log('요청 상세 정보')
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
        </>
    )
}