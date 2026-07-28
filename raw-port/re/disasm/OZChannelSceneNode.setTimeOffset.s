__ZN18OZChannelSceneNode13setTimeOffsetERK6CMTimeb:
0000000000213de0	pushq	%rbp
0000000000213de1	movq	%rsp, %rbp
0000000000213de4	pushq	%r15
0000000000213de6	pushq	%r14
0000000000213de8	pushq	%rbx
0000000000213de9	subq	$0x68, %rsp
0000000000213ded	movl	%edx, %r15d
0000000000213df0	movq	%rsi, %r14
0000000000213df3	movq	%rdi, %rbx
0000000000213df6	movq	(%rdi), %rax
0000000000213df9	leaq	-0x48(%rbp), %rdi
0000000000213dfd	movq	%rbx, %rsi
0000000000213e00	callq	*0x140(%rax)
0000000000213e06	movq	%rbx, %rdi
0000000000213e09	movq	%r14, %rsi
0000000000213e0c	movl	%r15d, %edx
0000000000213e0f	callq	0x6de7c6                        ## symbol stub for: __ZN23OZChannelObjectRootBase13setTimeOffsetERK6CMTimeb
0000000000213e14	cmpq	$0x0, 0x100(%rbx)
0000000000213e1c	je	0x213e6a
0000000000213e1e	movq	0x10(%r14), %rax
0000000000213e22	movq	%rax, -0x20(%rbp)
0000000000213e26	movups	(%r14), %xmm0
0000000000213e2a	movaps	%xmm0, -0x30(%rbp)
0000000000213e2e	movq	-0x20(%rbp), %rax
0000000000213e32	movq	%rax, 0x28(%rsp)
0000000000213e37	movaps	-0x30(%rbp), %xmm0
0000000000213e3b	movups	%xmm0, 0x18(%rsp)
0000000000213e40	movq	-0x38(%rbp), %rax
0000000000213e44	movq	%rax, 0x10(%rsp)
0000000000213e49	movups	-0x48(%rbp), %xmm0
0000000000213e4d	movups	%xmm0, (%rsp)
0000000000213e51	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000213e56	testl	%eax, %eax
0000000000213e58	je	0x213e6a
0000000000213e5a	movq	0x100(%rbx), %rdi
0000000000213e61	movq	(%rdi), %rax
0000000000213e64	callq	*0x4a0(%rax)
0000000000213e6a	addq	$0x68, %rsp
0000000000213e6e	popq	%rbx
0000000000213e6f	popq	%r14
0000000000213e71	popq	%r15
0000000000213e73	popq	%rbp
0000000000213e74	retq
0000000000213e75	nopw	%cs:(%rax,%rax)
