export default function LoadingMatch(params) {
  return (
    <div className="text-center m-5" >
      <button className="btn btn-primary" disabled style={{marginTop:"40%"}}>
        <span className="spinner-border spinner-border-sm"></span>
        <br></br>
        Waiting For {params.user} To Accept The Match
      </button>
    </div>
  );
}
