__ZN11PCColorUtil19applyPQ_InverseOETFEDv3_f:
0000000000003dbe	pushq	%rbp
0000000000003dbf	movq	%rsp, %rbp
0000000000003dc2	subq	$0x10, %rsp
0000000000003dc6	movaps	%xmm0, -0x10(%rbp)
0000000000003dca	callq	__ZN12_GLOBAL__N_12PQ19getTransferFunctionEv ## (anonymous namespace)::PQ::getTransferFunction()
0000000000003dcf	xorps	%xmm0, %xmm0
0000000000003dd2	movaps	-0x10(%rbp), %xmm1
0000000000003dd6	maxps	%xmm0, %xmm1
0000000000003dd9	minps	0xdddf0(%rip), %xmm1
0000000000003de0	blendps	$0x8, %xmm0, %xmm1              ## xmm1 = xmm1[0,1,2],xmm0[3]
0000000000003de6	movaps	%xmm1, %xmm0
0000000000003de9	movaps	0xde000(%rip), %xmm1
0000000000003df0	callq	0xde768                         ## symbol stub for: __simd_pow_f4
0000000000003df5	movaps	0xde004(%rip), %xmm2
0000000000003dfc	addps	%xmm0, %xmm2
0000000000003dff	xorps	%xmm1, %xmm1
0000000000003e02	maxps	%xmm1, %xmm2
0000000000003e05	mulps	0xde004(%rip), %xmm0
0000000000003e0c	addps	0xde00d(%rip), %xmm0
0000000000003e13	divps	%xmm0, %xmm2
0000000000003e16	blendps	$0x8, %xmm1, %xmm2              ## xmm2 = xmm2[0,1,2],xmm1[3]
0000000000003e1c	movaps	0xde00d(%rip), %xmm1
0000000000003e23	movaps	%xmm2, %xmm0
0000000000003e26	callq	0xde768                         ## symbol stub for: __simd_pow_f4
0000000000003e2b	mulps	0x15732e(%rip), %xmm0
0000000000003e32	addq	$0x10, %rsp
0000000000003e36	popq	%rbp
0000000000003e37	retq
