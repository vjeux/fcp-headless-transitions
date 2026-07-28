__ZNK32PCICCTransferFunctionParametric2clEf:
0000000000013bf8	pushq	%rbp
0000000000013bf9	movq	%rsp, %rbp
0000000000013bfc	pushq	%rbx
0000000000013bfd	pushq	%rax
0000000000013bfe	movq	%rdi, %rbx
0000000000013c01	movss	0xc(%rdi), %xmm1
0000000000013c06	movss	0x10(%rdi), %xmm2
0000000000013c0b	movaps	0xce44e(%rip), %xmm3
0000000000013c12	xorps	%xmm2, %xmm3
0000000000013c15	divss	%xmm1, %xmm3
0000000000013c19	ucomiss	%xmm3, %xmm0
0000000000013c1c	jae	0x13c25
0000000000013c1e	movss	0x14(%rbx), %xmm0
0000000000013c23	jmp	0x13c3f
0000000000013c25	mulss	%xmm1, %xmm0
0000000000013c29	addss	%xmm0, %xmm2
0000000000013c2d	movss	0x8(%rbx), %xmm1
0000000000013c32	movaps	%xmm2, %xmm0
0000000000013c35	callq	0xdea50                         ## symbol stub for: _powf
0000000000013c3a	addss	0x14(%rbx), %xmm0
0000000000013c3f	addq	$0x8, %rsp
0000000000013c43	popq	%rbx
0000000000013c44	popq	%rbp
0000000000013c45	retq
