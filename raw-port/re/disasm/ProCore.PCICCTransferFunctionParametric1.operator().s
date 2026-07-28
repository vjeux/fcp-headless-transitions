__ZNK32PCICCTransferFunctionParametric1clEf:
0000000000013b22	pushq	%rbp
0000000000013b23	movq	%rsp, %rbp
0000000000013b26	movss	0xc(%rdi), %xmm1
0000000000013b2b	movss	0x10(%rdi), %xmm2
0000000000013b30	movaps	0xce529(%rip), %xmm3
0000000000013b37	xorps	%xmm2, %xmm3
0000000000013b3a	divss	%xmm1, %xmm3
0000000000013b3e	ucomiss	%xmm3, %xmm0
0000000000013b41	jae	0x13b48
0000000000013b43	xorps	%xmm0, %xmm0
0000000000013b46	popq	%rbp
0000000000013b47	retq
0000000000013b48	mulss	%xmm1, %xmm0
0000000000013b4c	addss	%xmm0, %xmm2
0000000000013b50	movss	0x8(%rdi), %xmm1
0000000000013b55	movaps	%xmm2, %xmm0
0000000000013b58	popq	%rbp
0000000000013b59	jmp	0xdea50                         ## symbol stub for: _powf
