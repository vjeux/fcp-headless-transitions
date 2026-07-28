__ZN5HGMix9GetOutputEP10HGRenderer:
00000000000a6e50	pushq	%rbp
00000000000a6e51	movq	%rsp, %rbp
00000000000a6e54	pushq	%r14
00000000000a6e56	pushq	%rbx
00000000000a6e57	movq	%rdi, %rbx
00000000000a6e5a	movq	(%rdi), %rax
00000000000a6e5d	movq	0x198(%rdi), %r14
00000000000a6e64	xorl	%esi, %esi
00000000000a6e66	callq	*0x80(%rax)
00000000000a6e6c	movq	(%r14), %rcx
00000000000a6e6f	movq	%r14, %rdi
00000000000a6e72	xorl	%esi, %esi
00000000000a6e74	movq	%rax, %rdx
00000000000a6e77	callq	*0x78(%rcx)
00000000000a6e7a	movq	(%rbx), %rax
00000000000a6e7d	movq	0x198(%rbx), %r14
00000000000a6e84	movq	%rbx, %rdi
00000000000a6e87	movl	$0x1, %esi
00000000000a6e8c	callq	*0x80(%rax)
00000000000a6e92	movq	(%r14), %rcx
00000000000a6e95	movq	%r14, %rdi
00000000000a6e98	movl	$0x1, %esi
00000000000a6e9d	movq	%rax, %rdx
00000000000a6ea0	callq	*0x78(%rcx)
00000000000a6ea3	movq	0x198(%rbx), %rax
00000000000a6eaa	popq	%rbx
00000000000a6eab	popq	%r14
00000000000a6ead	popq	%rbp
00000000000a6eae	retq
00000000000a6eaf	nop
