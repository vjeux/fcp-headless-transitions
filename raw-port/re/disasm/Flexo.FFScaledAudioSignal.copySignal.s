__ZNK19FFScaledAudioSignal10copySignalEv:
0000000001258e40	pushq	%rbp
0000000001258e41	movq	%rsp, %rbp
0000000001258e44	pushq	%r14
0000000001258e46	pushq	%rbx
0000000001258e47	subq	$0x10, %rsp
0000000001258e4b	movq	%rdi, %r14
0000000001258e4e	movl	$0x30, %edi
0000000001258e53	callq	0x1497452                       ## symbol stub for: __Znwm
0000000001258e58	movq	%rax, %rbx
0000000001258e5b	movq	0x20(%r14), %rdi
0000000001258e5f	movsd	0x28(%r14), %xmm0
0000000001258e65	movsd	%xmm0, -0x18(%rbp)
0000000001258e6a	xorps	%xmm0, %xmm0
0000000001258e6d	movups	%xmm0, 0x8(%rax)
0000000001258e71	movb	$0x0, 0x18(%rax)
0000000001258e75	leaq	0x6c8b2c(%rip), %rax
0000000001258e7c	movq	%rax, (%rbx)
0000000001258e7f	movq	(%rdi), %rax
0000000001258e82	callq	*0x10(%rax)
0000000001258e85	movq	%rax, 0x20(%rbx)
0000000001258e89	movsd	-0x18(%rbp), %xmm0
0000000001258e8e	movsd	%xmm0, 0x28(%rbx)
0000000001258e93	movq	0x8(%rax), %rax
0000000001258e97	movq	%rax, 0x8(%rbx)
0000000001258e9b	movq	%rbx, %rax
0000000001258e9e	addq	$0x10, %rsp
0000000001258ea2	popq	%rbx
0000000001258ea3	popq	%r14
0000000001258ea5	popq	%rbp
0000000001258ea6	retq
0000000001258ea7	movq	%rax, %r14
0000000001258eaa	movq	%rbx, %rdi
0000000001258ead	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001258eb2	movq	%r14, %rdi
0000000001258eb5	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001258eba	nopw	(%rax,%rax)
