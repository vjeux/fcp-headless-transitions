__ZNK32FFSoundDesignerIISupportDelegate13urlForAVAssetEv:
0000000000e32660	pushq	%rbp
0000000000e32661	movq	%rsp, %rbp
0000000000e32664	pushq	%r14
0000000000e32666	pushq	%rbx
0000000000e32667	movq	%rdi, %rbx
0000000000e3266a	movq	0xabcf5f(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSURL
0000000000e32671	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000e32676	movq	%rax, %r14
0000000000e32679	movq	(%rbx), %rdi
0000000000e3267c	movq	0xd929fd(%rip), %rsi
0000000000e32683	movq	0xabb036(%rip), %rbx            ## Objc message: -[%rdi appendData:]
0000000000e3268a	callq	*%rbx
0000000000e3268c	movq	0xd85e2d(%rip), %rsi
0000000000e32693	movq	%rax, %rdi
0000000000e32696	callq	*%rbx
0000000000e32698	movq	0xdc1981(%rip), %rsi
0000000000e3269f	leaq	0xb80c02(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000e326a6	movq	%r14, %rdi
0000000000e326a9	xorl	%ecx, %ecx
0000000000e326ab	movq	%rax, %r8
0000000000e326ae	callq	*%rbx
0000000000e326b0	movq	%rax, %rdi
0000000000e326b3	popq	%rbx
0000000000e326b4	popq	%r14
0000000000e326b6	popq	%rbp
0000000000e326b7	jmp	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000e326bc	nopl	(%rax)
