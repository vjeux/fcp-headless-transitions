__ZN11PCColorUtil12applyPQ_OETFEDv3_f:
0000000000003d38	pushq	%rbp
0000000000003d39	movq	%rsp, %rbp
0000000000003d3c	subq	$0x10, %rsp
0000000000003d40	movaps	%xmm0, -0x10(%rbp)
0000000000003d44	callq	__ZN12_GLOBAL__N_12PQ19getTransferFunctionEv ## (anonymous namespace)::PQ::getTransferFunction()
0000000000003d49	xorps	%xmm0, %xmm0
0000000000003d4c	movaps	-0x10(%rbp), %xmm1
0000000000003d50	maxps	%xmm0, %xmm1
0000000000003d53	blendps	$0x8, %xmm0, %xmm1              ## xmm1 = xmm1[0,1,2],xmm0[3]
0000000000003d59	movaps	%xmm1, %xmm0
0000000000003d5c	movaps	0xde05d(%rip), %xmm1
0000000000003d63	callq	0xde768                         ## symbol stub for: __simd_pow_f4
0000000000003d68	movaps	__ZZN12_GLOBAL__N_12PQ19getTransferFunctionEvE6result(%rip), %xmm2 ## (anonymous namespace)::PQ::getTransferFunction()::result
0000000000003d6f	mulps	%xmm0, %xmm2
0000000000003d72	mulps	0x1573d7(%rip), %xmm0
0000000000003d79	addps	0xde050(%rip), %xmm2
0000000000003d80	addps	0xdde49(%rip), %xmm0
0000000000003d87	divps	%xmm0, %xmm2
0000000000003d8a	xorps	%xmm0, %xmm0
0000000000003d8d	blendps	$0x8, %xmm0, %xmm2              ## xmm2 = xmm2[0,1,2],xmm0[3]
0000000000003d93	movaps	0xde046(%rip), %xmm1
0000000000003d9a	movaps	%xmm2, %xmm0
0000000000003d9d	callq	0xde768                         ## symbol stub for: __simd_pow_f4
0000000000003da2	addq	$0x10, %rsp
0000000000003da6	popq	%rbp
0000000000003da7	retq
