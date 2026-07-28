__ZNK19FFAVFTimecodeCursor21presentationTimeStampEv:
0000000000df6a80	movq	0x10(%rsi), %rsi
0000000000df6a84	testq	%rsi, %rsi
0000000000df6a87	je	0xdf6aa8
0000000000df6a89	pushq	%rbp
0000000000df6a8a	movq	%rsp, %rbp
0000000000df6a8d	pushq	%rbx
0000000000df6a8e	pushq	%rax
0000000000df6a8f	movq	0xdfcb3a(%rip), %rdx
0000000000df6a96	movq	%rdi, %rbx
0000000000df6a99	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000df6a9e	movq	%rbx, %rax
0000000000df6aa1	addq	$0x8, %rsp
0000000000df6aa5	popq	%rbx
0000000000df6aa6	popq	%rbp
0000000000df6aa7	retq
0000000000df6aa8	xorps	%xmm0, %xmm0
0000000000df6aab	movups	%xmm0, (%rdi)
0000000000df6aae	movq	$0x0, 0x10(%rdi)
0000000000df6ab6	movq	%rdi, %rax
0000000000df6ab9	retq
0000000000df6aba	nopw	(%rax,%rax)
