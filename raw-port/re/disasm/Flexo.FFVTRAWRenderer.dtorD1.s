__ZN15FFVTRAWRendererD1Ev:
0000000000764540	pushq	%rbp
0000000000764541	movq	%rsp, %rbp
0000000000764544	pushq	%rbx
0000000000764545	pushq	%rax
0000000000764546	movq	%rdi, %rbx
0000000000764549	leaq	0x11a11c0(%rip), %rax
0000000000764550	movq	%rax, (%rdi)
0000000000764553	movq	0x8(%rdi), %rdi
0000000000764557	callq	*0x11891ab(%rip)                ## literal pool symbol address: _objc_release
000000000076455d	movq	0x10(%rbx), %rdi
0000000000764561	callq	*0x11891a1(%rip)                ## literal pool symbol address: _objc_release
0000000000764567	addq	$0x8, %rsp
000000000076456b	popq	%rbx
000000000076456c	popq	%rbp
000000000076456d	retq
000000000076456e	movq	%rax, %rdi
0000000000764571	callq	___clang_call_terminate
0000000000764576	nopw	%cs:(%rax,%rax)
