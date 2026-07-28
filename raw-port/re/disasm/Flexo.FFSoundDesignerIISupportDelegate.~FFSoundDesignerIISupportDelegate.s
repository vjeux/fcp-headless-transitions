__ZN32FFSoundDesignerIISupportDelegateD1Ev:
0000000000e32630	pushq	%rbp
0000000000e32631	movq	%rsp, %rbp
0000000000e32634	pushq	%rbx
0000000000e32635	pushq	%rax
0000000000e32636	movq	%rdi, %rbx
0000000000e32639	movq	(%rdi), %rdi
0000000000e3263c	callq	*0xabb0c6(%rip)                 ## literal pool symbol address: _objc_release
0000000000e32642	movq	0x8(%rbx), %rdi
0000000000e32646	addq	$0x8, %rsp
0000000000e3264a	popq	%rbx
0000000000e3264b	popq	%rbp
0000000000e3264c	jmp	0x1497692                       ## symbol stub for: _dispatch_release
0000000000e32651	movq	%rax, %rdi
0000000000e32654	callq	___clang_call_terminate
0000000000e32659	nopl	(%rax)
