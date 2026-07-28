__ZN14OZChannelScaleD1Ev:
00000000006575a0	pushq	%rbp
00000000006575a1	movq	%rsp, %rbp
00000000006575a4	pushq	%rbx
00000000006575a5	pushq	%rax
00000000006575a6	movq	%rdi, %rbx
00000000006575a9	movq	0x1292638(%rip), %rax           ## literal pool symbol address: __ZTV11OZChannel2D
00000000006575b0	leaq	0x10(%rax), %rcx
00000000006575b4	movq	%rcx, (%rdi)
00000000006575b7	addq	$0x358, %rax                    ## imm = 0x358
00000000006575bd	movq	%rax, 0x10(%rdi)
00000000006575c1	addq	$0x120, %rdi                    ## imm = 0x120
00000000006575c8	callq	0x1496f5a                       ## symbol stub for: __ZN9OZChannelD2Ev
00000000006575cd	leaq	0x88(%rbx), %rdi
00000000006575d4	callq	0x1496f5a                       ## symbol stub for: __ZN9OZChannelD2Ev
00000000006575d9	movq	%rbx, %rdi
00000000006575dc	addq	$0x8, %rsp
00000000006575e0	popq	%rbx
00000000006575e1	popq	%rbp
00000000006575e2	jmp	0x14965e2                       ## symbol stub for: __ZN17OZCompoundChannelD2Ev
00000000006575e7	nopw	(%rax,%rax)
