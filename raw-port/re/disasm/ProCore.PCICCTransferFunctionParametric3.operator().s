__ZNK32PCICCTransferFunctionParametric3clEf:
0000000000013cf8	pushq	%rbp
0000000000013cf9	movq	%rsp, %rbp
0000000000013cfc	ucomiss	0x18(%rdi), %xmm0
0000000000013d00	jae	0x13d09
0000000000013d02	mulss	0x14(%rdi), %xmm0
0000000000013d07	popq	%rbp
0000000000013d08	retq
0000000000013d09	mulss	0xc(%rdi), %xmm0
0000000000013d0e	addss	0x10(%rdi), %xmm0
0000000000013d13	movss	0x8(%rdi), %xmm1
0000000000013d18	popq	%rbp
0000000000013d19	jmp	0xdea50                         ## symbol stub for: _powf
