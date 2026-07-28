__ZNK32PCICCTransferFunctionParametric4clEf:
0000000000013df0	pushq	%rbp
0000000000013df1	movq	%rsp, %rbp
0000000000013df4	pushq	%rbx
0000000000013df5	pushq	%rax
0000000000013df6	movq	%rdi, %rbx
0000000000013df9	ucomiss	0x18(%rdi), %xmm0
0000000000013dfd	jae	0x13e0b
0000000000013dff	mulss	0x14(%rbx), %xmm0
0000000000013e04	addss	0x20(%rbx), %xmm0
0000000000013e09	jmp	0x13e24
0000000000013e0b	mulss	0xc(%rbx), %xmm0
0000000000013e10	addss	0x10(%rbx), %xmm0
0000000000013e15	movss	0x8(%rbx), %xmm1
0000000000013e1a	callq	0xdea50                         ## symbol stub for: _powf
0000000000013e1f	addss	0x1c(%rbx), %xmm0
0000000000013e24	addq	$0x8, %rsp
0000000000013e28	popq	%rbx
0000000000013e29	popq	%rbp
0000000000013e2a	retq
0000000000013e2b	nop
