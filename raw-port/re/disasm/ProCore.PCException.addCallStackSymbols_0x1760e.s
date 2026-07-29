000000000001760e	pushq	%rbp
000000000001760f	movq	%rsp, %rbp
0000000000017612	pushq	%r15
0000000000017614	pushq	%r14
0000000000017616	pushq	%rbx
0000000000017617	pushq	%rax
0000000000017618	movq	%rdi, %r14
000000000001761b	callq	0xde9ae                         ## symbol stub for: _objc_autoreleasePoolPush
0000000000017620	movq	%rax, %rbx
0000000000017623	movq	0x130056(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSThread
000000000001762a	movq	0x140407(%rip), %rsi
0000000000017631	callq	*0x130781(%rip)                 ## Objc message: _objc_msgSend
0000000000017637	movq	%rax, %r15
000000000001763a	testq	%rax, %rax
000000000001763d	je	0x17647
000000000001763f	movq	%r15, %rdi
0000000000017642	callq	0xde018                         ## symbol stub for: _CFRetain
0000000000017647	movq	%r15, -0x20(%rbp)
000000000001764b	movq	0x8(%r14), %rdi
000000000001764f	testq	%rdi, %rdi
0000000000017652	sete	%al
0000000000017655	cmpq	%r15, %rdi
0000000000017658	sete	%cl
000000000001765b	orb	%al, %cl
000000000001765d	jne	0x17668
000000000001765f	callq	0xde012                         ## symbol stub for: _CFRelease
0000000000017664	movq	-0x20(%rbp), %r15
0000000000017668	movq	%r15, 0x8(%r14)
000000000001766c	leaq	-0x20(%rbp), %rdi
0000000000017670	movq	$0x0, (%rdi)
0000000000017677	callq	__ZN7PCCFRefIPK9__CFArrayED2Ev  ## PCCFRef<__CFArray const*>::~PCCFRef()
000000000001767c	movq	%rbx, %rdi
000000000001767f	callq	0xde9a8                         ## symbol stub for: _objc_autoreleasePoolPop
0000000000017684	addq	$0x8, %rsp
0000000000017688	popq	%rbx
0000000000017689	popq	%r14
000000000001768b	popq	%r15
000000000001768d	popq	%rbp
000000000001768e	retq
000000000001768f	movq	%rax, %rbx
0000000000017692	leaq	-0x20(%rbp), %rdi
0000000000017696	callq	__ZN7PCCFRefIPK9__CFArrayED2Ev  ## PCCFRef<__CFArray const*>::~PCCFRef()
000000000001769b	movq	%rbx, %rdi
000000000001769e	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000176a3	nop
