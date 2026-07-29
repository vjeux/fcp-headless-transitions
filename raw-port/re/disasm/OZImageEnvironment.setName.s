__ZN18OZImageEnvironment7setNameERK8PCStringb:
00000000004d5b20	pushq	%rbp
00000000004d5b21	movq	%rsp, %rbp
00000000004d5b24	pushq	%r15
00000000004d5b26	pushq	%r14
00000000004d5b28	pushq	%rbx
00000000004d5b29	pushq	%rax
00000000004d5b2a	movl	%edx, %ebx
00000000004d5b2c	movq	%rsi, %r14
00000000004d5b2f	movq	%rdi, %r15
00000000004d5b32	addq	$0x4bb0, %rdi                   ## imm = 0x4BB0
00000000004d5b39	xorl	%edx, %edx
00000000004d5b3b	callq	0x6dd91a                        ## symbol stub for: __ZN13OZChannelBase7setNameERK8PCStringb
00000000004d5b40	addq	$0x10, %r15
00000000004d5b44	movq	%r15, %rdi
00000000004d5b47	movq	%r14, %rsi
00000000004d5b4a	movl	%ebx, %edx
00000000004d5b4c	addq	$0x8, %rsp
00000000004d5b50	popq	%rbx
00000000004d5b51	popq	%r14
00000000004d5b53	popq	%r15
00000000004d5b55	popq	%rbp
00000000004d5b56	jmp	__ZN19OZObjectManipulator7setNameERK8PCStringb ## OZObjectManipulator::setName(PCString const&, bool)
00000000004d5b5b	nopl	(%rax,%rax)
