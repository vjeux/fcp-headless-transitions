__ZN19OZHistogramDelegateD1Ev:
0000000000333e70	pushq	%rbp
0000000000333e71	movq	%rsp, %rbp
0000000000333e74	leaq	__ZTV19OZHistogramDelegate(%rip), %rax ## vtable for OZHistogramDelegate
0000000000333e7b	addq	$0x10, %rax
0000000000333e7f	movq	%rax, (%rdi)
0000000000333e82	movq	0x10(%rdi), %rax
0000000000333e86	testq	%rax, %rax
0000000000333e89	je	0x333e98
0000000000333e8b	movq	%rax, 0x18(%rdi)
0000000000333e8f	movq	%rax, %rdi
0000000000333e92	popq	%rbp
0000000000333e93	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000333e98	popq	%rbp
0000000000333e99	retq
0000000000333e9a	nopw	(%rax,%rax)
