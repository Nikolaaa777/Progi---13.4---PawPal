import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/clanarina.css";

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("hr-HR");
}

const Clanarina = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [fee, setFee] = useState(null); // string "10.00"
  const [status, setStatus] = useState({ is_active: false, valid_from: null, valid_until: null });

  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = searchParams.get("token");
  const membershipPaymentId = searchParams.get("membership_payment_id");
  const cancelled = searchParams.get("cancelled");

  const activeClass = status?.is_active ? "active" : "inactive";
  const statusText = status?.is_active ? "Aktivna" : "Neaktivna";

  const monthlyText = useMemo(() => {
    if (fee == null) return "-";
    return `${fee} € / mj`;
  }, [fee]);

  const refresh = async () => {
    const [feeRes, stRes] = await Promise.all([api.membershipFee(), api.membershipStatus()]);
    setFee(feeRes?.iznos ?? null);
    setStatus(stRes ?? { is_active: false, valid_from: null, valid_until: null });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        await refresh();
      } catch (e) {
        setError(e?.data?.error || "Greška kod dohvaćanja članarine.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ako se vratimo s PayPal-a: token + membership_payment_id
  useEffect(() => {
    (async () => {
      if (!token || !membershipPaymentId) return;

      try {
        setPayLoading(true);
        setError(null);

        const res = await api.confirmMembershipPayPal({
          token,
          membership_payment_id: membershipPaymentId,
        });

        if (!res?.success) {
          setError(res?.error || "Potvrda PayPal plaćanja nije uspjela.");
        } else {
          await refresh();
        }
      } catch (e) {
        setError(e?.data?.error || "Potvrda PayPal plaćanja nije uspjela.");
      } finally {
        setPayLoading(false);
        // makni parametre iz URL-a nakon obrade
        setSearchParams({});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, membershipPaymentId]);

  useEffect(() => {
    if (cancelled) {
      setError("Plaćanje je otkazano.");
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelled]);

  const handlePayPal = async (e) => {
    e.preventDefault();
    try {
      setPayLoading(true);
      setError(null);

      const res = await api.createMembershipPayPal();
      if (res?.success && res?.approval_url) {
        window.location.href = res.approval_url;
        return;
      }
      setError(res?.error || "Neuspješno kreiranje PayPal plaćanja.");
    } catch (e2) {
      setError(e2?.data?.error || "Neuspješno kreiranje PayPal plaćanja.");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="app">
      <main className="content clanarina-content">
        <div className="clanarina-card">
          <h1 className="clanarina-title">Članarina</h1>

          {error && <div className="clanarina-error">{error}</div>}

          {/* STATUS */}
          <div className="clanarina-status">
            <div>
              <span>Status</span>
              <strong className={activeClass}>{loading ? "..." : statusText}</strong>
            </div>

            <div>
              <span>Vrijedi od</span>
              <strong>{loading ? "..." : formatDate(status?.valid_from)}</strong>
            </div>

            <div>
              <span>Vrijedi do</span>
              <strong>{loading ? "..." : formatDate(status?.valid_until)}</strong>
            </div>

            <div>
              <span>Iznos</span>
              <strong>{loading ? "..." : monthlyText}</strong>
            </div>
          </div>

          {/* PAYPAL PAYMENT */}
          <form className="clanarina-form" onSubmit={handlePayPal}>
            <h2>Plaćanje članarine</h2>

            <div className="clanarina-actions">
              <button
                type="submit"
                className="clanarina-pay-btn"
                disabled={loading || payLoading || fee == null}
              >
                {payLoading ? "Obrađujem..." : "Plati članarinu (PayPal)"}
              </button>
            </div>
          </form>

          <div className="clanarina-note">
            Nakon uspješne uplate članarina vrijedi sljedećih 30 dana.
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clanarina;
