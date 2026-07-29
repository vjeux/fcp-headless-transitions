+[FFIsNotZeroValueTransformer transformedValueClass]:
00000000012fd970	pushq	%rbp
00000000012fd971	movq	%rsp, %rbp
00000000012fd974	movq	0x5efb6d(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSNumber
00000000012fd97b	popq	%rbp
00000000012fd97c	jmp	0x149798c                       ## symbol stub for: _objc_opt_class
00000000012fd981	nopw	%cs:(%rax,%rax)
+[FFIsNotZeroValueTransformer allowsReverseTransformation]:
00000000012fd990	pushq	%rbp
00000000012fd991	movq	%rsp, %rbp
00000000012fd994	movl	$0x1, %eax
00000000012fd999	popq	%rbp
00000000012fd99a	retq
00000000012fd99b	nopl	(%rax,%rax)
-[FFIsNotZeroValueTransformer transformedValue:]:
00000000012fd9a0	pushq	%rbp
00000000012fd9a1	movq	%rsp, %rbp
00000000012fd9a4	pushq	%r14
00000000012fd9a6	pushq	%rbx
00000000012fd9a7	movq	%rdx, %rdi
00000000012fd9aa	movq	0x5efb37(%rip), %rbx            ## literal pool symbol address: _OBJC_CLASS_$_NSNumber
00000000012fd9b1	movq	0x8bd528(%rip), %rsi
00000000012fd9b8	movq	0x5efd01(%rip), %r14            ## Objc message: -[%rdi pointSize]
00000000012fd9bf	callq	*%r14
00000000012fd9c2	xorl	%edx, %edx
00000000012fd9c4	testl	%eax, %eax
00000000012fd9c6	setne	%dl
00000000012fd9c9	movq	0x8bae30(%rip), %rsi
00000000012fd9d0	movq	%rbx, %rdi
00000000012fd9d3	movq	%r14, %rax
00000000012fd9d6	popq	%rbx
00000000012fd9d7	popq	%r14
00000000012fd9d9	popq	%rbp
00000000012fd9da	jmpq	*%rax
00000000012fd9dc	nopl	(%rax)
-[FFIsNotZeroValueTransformer reverseTransformedValue:]:
00000000012fd9e0	pushq	%rbp
00000000012fd9e1	movq	%rsp, %rbp
00000000012fd9e4	pushq	%r14
