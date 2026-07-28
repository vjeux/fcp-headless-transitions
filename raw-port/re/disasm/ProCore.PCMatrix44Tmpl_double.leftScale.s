__ZN14PCMatrix44TmplIdE9leftScaleEddd:
000000000004f552	pushq	%rbp
000000000004f553	movq	%rsp, %rbp
000000000004f556	ucomisd	0xd2fd2(%rip), %xmm0
000000000004f55e	jne	0x4f562
000000000004f560	jnp	0x4f580
000000000004f562	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000004f566	movupd	(%rdi), %xmm3
000000000004f56a	movupd	0x10(%rdi), %xmm4
000000000004f56f	mulpd	%xmm0, %xmm3
000000000004f573	movupd	%xmm3, (%rdi)
000000000004f577	mulpd	%xmm0, %xmm4
000000000004f57b	movupd	%xmm4, 0x10(%rdi)
000000000004f580	ucomisd	0xd2fa8(%rip), %xmm1
000000000004f588	jne	0x4f58c
000000000004f58a	jnp	0x4f5ac
000000000004f58c	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
000000000004f590	movupd	0x20(%rdi), %xmm1
000000000004f595	movupd	0x30(%rdi), %xmm3
000000000004f59a	mulpd	%xmm0, %xmm1
000000000004f59e	movupd	%xmm1, 0x20(%rdi)
000000000004f5a3	mulpd	%xmm0, %xmm3
000000000004f5a7	movupd	%xmm3, 0x30(%rdi)
000000000004f5ac	ucomisd	0xd2f7c(%rip), %xmm2
000000000004f5b4	jne	0x4f5b8
000000000004f5b6	jnp	0x4f5d8
000000000004f5b8	movddup	%xmm2, %xmm0                    ## xmm0 = xmm2[0,0]
000000000004f5bc	movupd	0x40(%rdi), %xmm1
000000000004f5c1	movupd	0x50(%rdi), %xmm2
000000000004f5c6	mulpd	%xmm0, %xmm1
000000000004f5ca	movupd	%xmm1, 0x40(%rdi)
000000000004f5cf	mulpd	%xmm0, %xmm2
000000000004f5d3	movupd	%xmm2, 0x50(%rdi)
000000000004f5d8	popq	%rbp
000000000004f5d9	retq
