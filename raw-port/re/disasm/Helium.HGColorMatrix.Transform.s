__ZNK13HGColorMatrix9TransformEDv4_f:
00000000001b8ca0	pushq	%rbp
00000000001b8ca1	movq	%rsp, %rbp
00000000001b8ca4	movaps	%xmm0, %xmm1
00000000001b8ca7	shufps	$0x0, %xmm0, %xmm1              ## xmm1 = xmm1[0,0],xmm0[0,0]
00000000001b8cab	mulps	0x1b0(%rdi), %xmm1
00000000001b8cb2	movaps	%xmm0, %xmm2
00000000001b8cb5	shufps	$0x55, %xmm0, %xmm2             ## xmm2 = xmm2[1,1],xmm0[1,1]
00000000001b8cb9	mulps	0x1c0(%rdi), %xmm2
00000000001b8cc0	addps	%xmm1, %xmm2
00000000001b8cc3	movaps	%xmm0, %xmm1
00000000001b8cc6	shufps	$0xaa, %xmm0, %xmm1             ## xmm1 = xmm1[2,2],xmm0[2,2]
00000000001b8cca	mulps	0x1d0(%rdi), %xmm1
00000000001b8cd1	addps	%xmm2, %xmm1
00000000001b8cd4	shufps	$0xff, %xmm0, %xmm0             ## xmm0 = xmm0[3,3,3,3]
00000000001b8cd8	mulps	0x1e0(%rdi), %xmm0
00000000001b8cdf	addps	%xmm1, %xmm0
00000000001b8ce2	popq	%rbp
00000000001b8ce3	retq
00000000001b8ce4	nopw	%cs:(%rax,%rax)
