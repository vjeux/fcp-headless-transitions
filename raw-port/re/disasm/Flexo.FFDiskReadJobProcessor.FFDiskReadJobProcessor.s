__ZN22FFDiskReadJobProcessorC1Ei:
0000000000dff0d0	pushq	%rbp
0000000000dff0d1	movq	%rsp, %rbp
0000000000dff0d4	pushq	%r14
0000000000dff0d6	pushq	%rbx
0000000000dff0d7	movl	%esi, %r14d
0000000000dff0da	movq	%rdi, %rbx
0000000000dff0dd	leaq	0xb170e4(%rip), %rax
0000000000dff0e4	movq	%rax, (%rdi)
0000000000dff0e7	xorps	%xmm0, %xmm0
0000000000dff0ea	movups	%xmm0, 0x8(%rdi)
0000000000dff0ee	movups	%xmm0, 0x18(%rdi)
0000000000dff0f2	movups	%xmm0, 0x28(%rdi)
0000000000dff0f6	movups	%xmm0, 0x38(%rdi)
0000000000dff0fa	movq	$0x0, 0x48(%rdi)
0000000000dff102	movl	$0x1, %esi
0000000000dff107	xorl	%edi, %edi
0000000000dff109	callq	0x1497680                       ## symbol stub for: _dispatch_queue_attr_make_with_autorelease_frequency
0000000000dff10e	leaq	0x8639e9(%rip), %rdi            ## literal pool for: "com.apple.flexo.drjpfig"
0000000000dff115	movq	%rax, %rsi
0000000000dff118	callq	0x149768c                       ## symbol stub for: _dispatch_queue_create
0000000000dff11d	movq	%rax, 0x50(%rbx)
0000000000dff121	movb	$0x0, 0x58(%rbx)
0000000000dff125	movl	%r14d, 0x5c(%rbx)
0000000000dff129	movl	$0x0, 0x60(%rbx)
0000000000dff130	movslq	%r14d, %rdi
0000000000dff133	callq	0x14976a4                       ## symbol stub for: _dispatch_semaphore_create
0000000000dff138	movq	%rax, 0x68(%rbx)
0000000000dff13c	leaq	0xb170d5(%rip), %rax
0000000000dff143	movq	%rax, (%rbx)
0000000000dff146	popq	%rbx
0000000000dff147	popq	%r14
0000000000dff149	popq	%rbp
0000000000dff14a	retq
0000000000dff14b	nopl	(%rax,%rax)
