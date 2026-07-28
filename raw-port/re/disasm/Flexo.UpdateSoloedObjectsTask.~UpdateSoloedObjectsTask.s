__ZN23UpdateSoloedObjectsTaskD0Ev:
0000000000e4ff20	pushq	%rbp
0000000000e4ff21	movq	%rsp, %rbp
0000000000e4ff24	pushq	%rbx
0000000000e4ff25	pushq	%rax
0000000000e4ff26	movq	%rdi, %rbx
0000000000e4ff29	leaq	0xac77f0(%rip), %rax
0000000000e4ff30	movq	%rax, (%rdi)
0000000000e4ff33	movq	0x10(%rdi), %rdi
0000000000e4ff37	callq	*0xa9d7cb(%rip)                 ## literal pool symbol address: _objc_release
0000000000e4ff3d	movq	%rbx, %rdi
0000000000e4ff40	addq	$0x8, %rsp
0000000000e4ff44	popq	%rbx
0000000000e4ff45	popq	%rbp
0000000000e4ff46	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000e4ff4b	movq	%rax, %rdi
0000000000e4ff4e	callq	___clang_call_terminate
0000000000e4ff53	nopw	%cs:(%rax,%rax)
