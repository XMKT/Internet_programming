// Характеристики товара
function SpecificationsTable({ characteristics }) {
    // Если характеристик нет, ничего не показываем
    if (!characteristics || Object.keys(characteristics).length === 0) {
        return null;
    }

    return (
        <>
            <h4>Характеристики:</h4>
            <table className="specifications">
                <tbody>
                    {Object.entries(characteristics).map(([key, value]) => (
                        <tr key={key}>
                            <td>{key}:</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default SpecificationsTable;
