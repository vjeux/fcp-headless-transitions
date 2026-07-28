__ZN32FFSoundDesignerIISupportDelegateC2EP5NSURL:
0000000000e32540	pushq	%rbp
0000000000e32541	movq	%rsp, %rbp
0000000000e32544	pushq	%r14
0000000000e32546	pushq	%rbx
0000000000e32547	movq	%rsi, %r14
0000000000e3254a	movq	%rdi, %rbx
0000000000e3254d	xorps	%xmm0, %xmm0
0000000000e32550	movups	%xmm0, (%rdi)
0000000000e32553	leaq	_OBJC_CLASS_$_FFSoundDesignerIISupportResourceLoaderDelegate(%rip), %rdi
0000000000e3255a	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000e3255f	movq	0xd8a92a(%rip), %rsi
0000000000e32566	movq	%rax, %rdi
0000000000e32569	movq	%r14, %rdx
0000000000e3256c	callq	*0xabb14e(%rip)                 ## Objc message: -[%rdi appendData:]
0000000000e32572	movq	%rax, (%rbx)
0000000000e32575	movl	$0x1, %esi
0000000000e3257a	xorl	%edi, %edi
0000000000e3257c	callq	0x1497680                       ## symbol stub for: _dispatch_queue_attr_make_with_autorelease_frequency
0000000000e32581	leaq	0x83240f(%rip), %rdi            ## literal pool for: "com.apple.flexo.sd2ResourceLoaderQueue"
0000000000e32588	movq	%rax, %rsi
0000000000e3258b	callq	0x149768c                       ## symbol stub for: _dispatch_queue_create
0000000000e32590	movq	%rax, 0x8(%rbx)
0000000000e32594	popq	%rbx
0000000000e32595	popq	%r14
0000000000e32597	popq	%rbp
0000000000e32598	retq
0000000000e32599	nopl	(%rax)
__ZN32FFSoundDesignerIISupportDelegateC1EP5NSURL:
