+[FFExifParser secondsFromOffsetString:]:
0000000000397860	pushq	%rbp
0000000000397861	movq	%rsp, %rbp
0000000000397864	pushq	%r15
0000000000397866	pushq	%r14
0000000000397868	pushq	%r13
000000000039786a	pushq	%r12
000000000039786c	pushq	%rbx
000000000039786d	subq	$0x18, %rsp
0000000000397871	movq	%rdx, %r14
0000000000397874	movabsq	$0x7fffffffffffffff, %rbx       ## imm = 0x7FFFFFFFFFFFFFFF
000000000039787e	movq	0x18215d3(%rip), %rsi
0000000000397885	movq	%rdx, %rdi
0000000000397888	callq	*0x1555e32(%rip)                ## Objc message: -[%rdi colorFolderPath]
000000000039788e	cmpq	$0x6, %rax
0000000000397892	jne	0x3979f9
0000000000397898	movq	0x1825819(%rip), %r12
000000000039789f	leaq	0x15a1f22(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
00000000003978a6	movq	%r14, %rdi
00000000003978a9	movq	%r12, %rsi
00000000003978ac	callq	*0x1555e0e(%rip)                ## Objc message: -[%rdi colorFolderPath]
00000000003978b2	movq	$-0x1, %rcx
00000000003978b9	testb	%al, %al
00000000003978bb	jne	0x3978dd
00000000003978bd	leaq	0x15b08a4(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
00000000003978c4	movq	%r14, %rdi
00000000003978c7	movq	%r12, %rsi
00000000003978ca	callq	*0x1555df0(%rip)                ## Objc message: -[%rdi colorFolderPath]
00000000003978d0	movl	$0x1, %ecx
00000000003978d5	testb	%al, %al
00000000003978d7	je	0x3979f9
00000000003978dd	movq	%rcx, -0x38(%rbp)
00000000003978e1	movq	0x1823ee0(%rip), %rsi
00000000003978e8	movq	0x1555dd1(%rip), %r13           ## Objc message: -[%rdi colorFolderPath]
00000000003978ef	movl	$0x1, %edx
00000000003978f4	movq	%r14, %rdi
00000000003978f7	callq	*%r13
00000000003978fa	movq	0x1823ecf(%rip), %rsi
0000000000397901	leaq	0x15a10a0(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
0000000000397908	movq	%rax, %rdi
000000000039790b	callq	*%r13
000000000039790e	movq	%rax, %r12
0000000000397911	movq	0x1820c38(%rip), %rsi
0000000000397918	movq	%rax, %rdi
000000000039791b	callq	*%r13
000000000039791e	cmpq	$0x2, %rax
0000000000397922	jne	0x3979f9
0000000000397928	movq	0x1820d51(%rip), %rsi
000000000039792f	movq	%r12, %rdi
0000000000397932	xorl	%edx, %edx
0000000000397934	callq	*%r13
0000000000397937	movq	%rax, %r15
000000000039793a	movl	$0x1, %edx
000000000039793f	movq	%r12, %rdi
0000000000397942	movq	0x1820d37(%rip), %rsi
0000000000397949	callq	*%r13
000000000039794c	movq	%rax, %r12
000000000039794f	movq	%r15, -0x30(%rbp)
0000000000397953	movq	%r15, %rdi
0000000000397956	movq	0x18214fb(%rip), %r15
000000000039795d	movq	%r15, %rsi
0000000000397960	callq	*%r13
0000000000397963	cmpq	$0x2, %rax
0000000000397967	jne	0x3979f9
000000000039796d	movq	%r12, %rdi
0000000000397970	movq	%r15, %rsi
0000000000397973	callq	*0x1555d47(%rip)                ## Objc message: -[%rdi colorFolderPath]
0000000000397979	cmpq	$0x2, %rax
000000000039797d	jne	0x3979f9
000000000039797f	movq	0x1821fa2(%rip), %r13
0000000000397986	movq	-0x30(%rbp), %rdi
000000000039798a	movq	%r13, %rsi
000000000039798d	callq	*0x1555d2d(%rip)                ## Objc message: -[%rdi colorFolderPath]
0000000000397993	testq	%rax, %rax
0000000000397996	js	0x3979f9
0000000000397998	movq	%rax, %r15
000000000039799b	movq	%r12, %rdi
000000000039799e	movq	%r13, %rsi
00000000003979a1	callq	*0x1555d19(%rip)                ## Objc message: -[%rdi colorFolderPath]
00000000003979a7	testq	%rax, %rax
00000000003979aa	js	0x3979f9
00000000003979ac	imulq	$0xe10, %r15, %rcx              ## imm = 0xE10
00000000003979b3	imulq	$0x3c, %rax, %r12
00000000003979b7	addq	%rcx, %r12
00000000003979ba	jne	0x3979f1
00000000003979bc	movq	0x1820c05(%rip), %r15
00000000003979c3	leaq	0x15b07be(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
00000000003979ca	movq	%r14, %rdi
00000000003979cd	movq	%r15, %rsi
00000000003979d0	callq	*0x1555cea(%rip)                ## Objc message: -[%rdi colorFolderPath]
00000000003979d6	testb	%al, %al
00000000003979d8	jne	0x3979f1
00000000003979da	leaq	0x15b07c7(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
00000000003979e1	movq	%r14, %rdi
00000000003979e4	movq	%r15, %rsi
00000000003979e7	callq	*0x1555cd3(%rip)                ## Objc message: -[%rdi colorFolderPath]
00000000003979ed	testb	%al, %al
00000000003979ef	je	0x3979f9
00000000003979f1	imulq	-0x38(%rbp), %r12
00000000003979f6	movq	%r12, %rbx
00000000003979f9	movq	%rbx, %rax
00000000003979fc	addq	$0x18, %rsp
0000000000397a00	popq	%rbx
0000000000397a01	popq	%r12
0000000000397a03	popq	%r13
0000000000397a05	popq	%r14
0000000000397a07	popq	%r15
0000000000397a09	popq	%rbp
0000000000397a0a	retq
