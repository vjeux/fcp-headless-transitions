__ZN13PCGenBlockRefIfEC2Ei:
00000000000ba07c	pushq	%rbp
00000000000ba07d	movq	%rsp, %rbp
00000000000ba080	pushq	%r15
00000000000ba082	pushq	%r14
00000000000ba084	pushq	%rbx
00000000000ba085	pushq	%rax
00000000000ba086	movq	%rdi, %rbx
00000000000ba089	testl	%esi, %esi
00000000000ba08b	je	0xba0be
00000000000ba08d	movl	%esi, %r15d
00000000000ba090	shll	$0x2, %r15d
00000000000ba094	leal	0x8(,%rsi,4), %eax
00000000000ba09b	movslq	%eax, %rdi
00000000000ba09e	callq	0xde6c6                         ## symbol stub for: __Znam
00000000000ba0a3	leaq	0x8(%rax), %r14
00000000000ba0a7	movl	%r15d, (%rax)
00000000000ba0aa	movl	$0x1, 0x4(%rax)
00000000000ba0b1	movslq	%r15d, %rsi
00000000000ba0b4	movq	%r14, %rdi
00000000000ba0b7	callq	0xde79e                         ## symbol stub for: _bzero
00000000000ba0bc	jmp	0xba0c1
00000000000ba0be	xorl	%r14d, %r14d
00000000000ba0c1	movq	%r14, (%rbx)
00000000000ba0c4	addq	$0x8, %rsp
00000000000ba0c8	popq	%rbx
00000000000ba0c9	popq	%r14
00000000000ba0cb	popq	%r15
00000000000ba0cd	popq	%rbp
00000000000ba0ce	retq
00000000000ba0cf	nop
