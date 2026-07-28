__ZN32FFSoundDesignerIISupportDelegateC1EP5NSURL:
0000000000e325a0	pushq	%rbp
0000000000e325a1	movq	%rsp, %rbp
0000000000e325a4	pushq	%r14
0000000000e325a6	pushq	%rbx
0000000000e325a7	movq	%rsi, %r14
0000000000e325aa	movq	%rdi, %rbx
0000000000e325ad	xorps	%xmm0, %xmm0
0000000000e325b0	movups	%xmm0, (%rdi)
0000000000e325b3	leaq	_OBJC_CLASS_$_FFSoundDesignerIISupportResourceLoaderDelegate(%rip), %rdi
0000000000e325ba	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000e325bf	movq	0xd8a8ca(%rip), %rsi
0000000000e325c6	movq	%rax, %rdi
0000000000e325c9	movq	%r14, %rdx
0000000000e325cc	callq	*0xabb0ee(%rip)                 ## Objc message: -[%rdi appendData:]
0000000000e325d2	movq	%rax, (%rbx)
0000000000e325d5	movl	$0x1, %esi
0000000000e325da	xorl	%edi, %edi
0000000000e325dc	callq	0x1497680                       ## symbol stub for: _dispatch_queue_attr_make_with_autorelease_frequency
0000000000e325e1	leaq	0x8323af(%rip), %rdi            ## literal pool for: "com.apple.flexo.sd2ResourceLoaderQueue"
0000000000e325e8	movq	%rax, %rsi
0000000000e325eb	callq	0x149768c                       ## symbol stub for: _dispatch_queue_create
0000000000e325f0	movq	%rax, 0x8(%rbx)
0000000000e325f4	popq	%rbx
0000000000e325f5	popq	%r14
0000000000e325f7	popq	%rbp
0000000000e325f8	retq
0000000000e325f9	nopl	(%rax)
