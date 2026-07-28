__ZN9POStateGLD0Ev:
0000000000346190	pushq	%rbp
0000000000346191	movq	%rsp, %rbp
0000000000346194	pushq	%rbx
0000000000346195	pushq	%rax
0000000000346196	movq	%rdi, %rbx
0000000000346199	leaq	__ZTV9POStateGL(%rip), %rax     ## vtable for POStateGL
00000000003461a0	addq	$0x10, %rax
00000000003461a4	movq	%rax, (%rdi)
00000000003461a7	callq	__ZNK9POStateGL12initialStateEv ## POStateGL::initialState() const
00000000003461ac	movq	%rbx, %rdi
00000000003461af	addq	$0x8, %rsp
00000000003461b3	popq	%rbx
00000000003461b4	popq	%rbp
00000000003461b5	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003461ba	movq	%rax, %rdi
00000000003461bd	callq	___clang_call_terminate
00000000003461c2	nopw	%cs:(%rax,%rax)
