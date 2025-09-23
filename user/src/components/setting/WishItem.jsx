import { useState } from 'react';
import { Box, Typography, IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

const WishItem = ({ donation, handleDelete, handleUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuantity, setEditedQuantity] = useState(donation.quantity);

    const handleSave = () => {
        handleUpdate(donation.id, { quantity: Number(editedQuantity) });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedQuantity(donation.quantity);
        setIsEditing(false);
    };

    return (
        <Box key={donation.id} sx={{ borderRadius: '12px', border: '1px solid #F3F4F6', my: 1, }}>
            <Box sx={{ p: '19px', }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='caption'>{donation.category || '미분류'} &gt; {donation.subcategory || '미분류'}</Typography>
                    <Box>
                        <IconButton onClick={() => setIsEditing(!isEditing)} sx={{ color: "#666", width: '20px', height: '20px', p: 0, mr: 1 }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(donation.id)} sx={{ color: "#D8D8D8", width: '20px', height: '20px', p: 0 }}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 0.5 }}>{donation.item_name}</Typography>

                {isEditing ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <TextField
                            size="small"
                            type="number"
                            value={editedQuantity}
                            onChange={(e) => setEditedQuantity(e.target.value)}
                            sx={{ width: 100 }}
                            inputProps={{ min: 0 }}
                        />
                        <Typography variant='body2'>{donation.unit || '개'}</Typography>
                        <Button size="small" onClick={handleSave} variant="contained">저장</Button>
                        <Button size="small" onClick={handleCancel}>취소</Button>
                    </Box>
                ) : (
                    <Typography variant='body2' color="#1428A0">수량: {donation.quantity || 0}{donation.unit || '개'}</Typography>
                )}
            </Box>
        </Box>
    );
};

export default WishItem;