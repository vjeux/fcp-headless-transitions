-[CountTransformer transformedValue:]:
000000000058d720	testq	%rdx, %rdx
000000000058d723	je	0x58d75c
000000000058d725	pushq	%rbp
000000000058d726	movq	%rsp, %rbp
000000000058d729	pushq	%r14
000000000058d72b	pushq	%rbx
000000000058d72c	movq	0x135fdb5(%rip), %rbx           ## literal pool symbol address: _OBJC_CLASS_$_NSNumber
000000000058d733	movq	0x162ae16(%rip), %rsi
000000000058d73a	movq	0x135ff7f(%rip), %r14           ## Objc message: -[%rdi effectBundleFromData:error:]
000000000058d741	movq	%rdx, %rdi
000000000058d744	callq	*%r14
000000000058d747	movq	0x162c7a2(%rip), %rsi
000000000058d74e	movq	%rbx, %rdi
000000000058d751	movl	%eax, %edx
000000000058d753	movq	%r14, %rax
000000000058d756	popq	%rbx
000000000058d757	popq	%r14
000000000058d759	popq	%rbp
000000000058d75a	jmpq	*%rax
000000000058d75c	xorl	%eax, %eax
000000000058d75e	retq
