__ZN17FFNSObjectStorageD0Ev:
0000000000569ad0	pushq	%rbp
0000000000569ad1	movq	%rsp, %rbp
0000000000569ad4	pushq	%rbx
0000000000569ad5	pushq	%rax
0000000000569ad6	movq	%rdi, %rbx
0000000000569ad9	leaq	0x1394f90(%rip), %rax
0000000000569ae0	movq	%rax, (%rdi)
0000000000569ae3	movq	0x10(%rdi), %rdi
0000000000569ae7	callq	*0x1383c1b(%rip)                ## literal pool symbol address: _objc_release
0000000000569aed	movq	%rbx, %rdi
0000000000569af0	callq	0x1496d86                       ## symbol stub for: __ZN8HGObjectD2Ev
0000000000569af5	movq	%rbx, %rdi
0000000000569af8	addq	$0x8, %rsp
0000000000569afc	popq	%rbx
0000000000569afd	popq	%rbp
0000000000569afe	jmp	0x1496d8c                       ## symbol stub for: __ZN8HGObjectdlEPv
0000000000569b03	movq	%rax, %rdi
0000000000569b06	callq	___clang_call_terminate
0000000000569b0b	nopl	(%rax,%rax)
