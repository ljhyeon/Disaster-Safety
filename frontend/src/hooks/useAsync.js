import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

export const useAsync = (asyncFn, deps = [], options = {}) => {
    const {
        immediate = true,
        onSuccess,
        onError,
        errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.'
    } = options

    const [state, setState] = useState({
        data: null,
        loading: immediate,
        error: null
    })

    const execute = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const result = await asyncFn()
            setState({ data: result, loading: false, error: null })

            if (onSuccess) onSuccess(result)
            return result
        } catch (error) {
            setState({ data: null, loading: false, error })

            if (onError) {
                onError(error)
            } else {
                message.error(errorMessage)
                console.error('Async error:', error)
            }
            throw error
        }
    }, deps)

    useEffect(() => {
        if (immediate) {
            execute()
        }
    }, deps)

    return { ...state, execute, refetch: execute }
}