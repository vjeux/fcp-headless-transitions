__ZNK19FFAVFTimecodeCursor15decodeTimeStampEv:
0000000000df6ac0	movq	0x10(%rsi), %rsi
0000000000df6ac4	testq	%rsi, %rsi
0000000000df6ac7	je	0xdf6ae8
0000000000df6ac9	pushq	%rbp
0000000000df6aca	movq	%rsp, %rbp
0000000000df6acd	pushq	%rbx
0000000000df6ace	pushq	%rax
0000000000df6acf	movq	0xdfcb02(%rip), %rdx
0000000000df6ad6	movq	%rdi, %rbx
0000000000df6ad9	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000df6ade	movq	%rbx, %rax
0000000000df6ae1	addq	$0x8, %rsp
0000000000df6ae5	popq	%rbx
0000000000df6ae6	popq	%rbp
0000000000df6ae7	retq
0000000000df6ae8	xorps	%xmm0, %xmm0
0000000000df6aeb	movups	%xmm0, (%rdi)
0000000000df6aee	movq	$0x0, 0x10(%rdi)
0000000000df6af6	movq	%rdi, %rax
0000000000df6af9	retq
0000000000df6afa	nopw	(%rax,%rax)
