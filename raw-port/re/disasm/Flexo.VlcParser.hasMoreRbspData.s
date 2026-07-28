__ZN9VlcParser15hasMoreRbspDataEv:
00000000014215e0	movl	0x8(%rdi), %ecx
00000000014215e3	movl	0x28(%rdi), %eax
00000000014215e6	leaq	0x20(%rcx), %rdx
00000000014215ea	cmpq	%rax, %rdx
00000000014215ed	jbe	0x142161e
00000000014215ef	subl	%eax, %ecx
00000000014215f1	leal	0x20(%rcx), %edx
00000000014215f4	movb	$0x1, %al
00000000014215f6	cmpl	$0x8, %edx
00000000014215f9	jg	0x1421620
00000000014215fb	pushq	%rbp
00000000014215fc	movq	%rsp, %rbp
00000000014215ff	movq	0x20(%rdi), %rax
0000000001421603	movzbl	-0x1(%rax), %eax
0000000001421607	tzcntl	%eax, %eax
000000000142160b	xorb	$0x7, %al
000000000142160d	movzbl	%al, %eax
0000000001421610	movl	$0xffffffe8, %edx               ## imm = 0xFFFFFFE8
0000000001421615	subl	%ecx, %edx
0000000001421617	cmpl	%eax, %edx
0000000001421619	setne	%al
000000000142161c	popq	%rbp
000000000142161d	retq
000000000142161e	xorl	%eax, %eax
0000000001421620	retq
0000000001421621	addb	%al, (%rax)
0000000001421623	addb	%al, (%rax)
0000000001421625	addb	%al, (%rax)
0000000001421627	addb	%al, (%rax)
0000000001421629	addb	%al, (%rax)
000000000142162b	addb	%al, (%rax)
000000000142162d	addb	%al, (%rax)
000000000142162f	addb	%dl, 0x48(%rbp)
0000000001421632	movl	%esp, %ebp
0000000001421634	pushq	%r15
0000000001421636	pushq	%r14
0000000001421638	pushq	%r13
000000000142163a	pushq	%r12
000000000142163c	pushq	%rbx
000000000142163d	subq	$0x58, %rsp
0000000001421641	movq	%rsi, %r15
0000000001421644	movq	$0x0, -0x48(%rbp)
000000000142164c	movq	0x4ce035(%rip), %rdx            ## literal pool symbol address: _kCFTypeDictionaryKeyCallBacks
0000000001421653	movq	0x4ce036(%rip), %rcx            ## literal pool symbol address: _kCFTypeDictionaryValueCallBacks
000000000142165a	movl	$0x1, %esi
000000000142165f	movq	%rdi, -0x40(%rbp)
0000000001421663	callq	0x1494794                       ## symbol stub for: _CFDictionaryCreateMutable
0000000001421668	movq	%rax, -0x38(%rbp)
000000000142166c	testq	%rax, %rax
000000000142166f	je	0x14216d7
0000000001421671	movq	0x7d22e0(%rip), %rsi
0000000001421678	movq	0x4cc041(%rip), %rbx            ## Objc message: -[%rdi isEvent]
000000000142167f	movq	%r15, %rdi
0000000001421682	xorl	%edx, %edx
0000000001421684	callq	*%rbx
0000000001421686	movq	%rax, %r12
0000000001421689	movq	0x7e2840(%rip), %rsi
0000000001421690	movq	%r15, %rdi
0000000001421693	callq	*%rbx
0000000001421695	movzwl	%ax, %eax
0000000001421698	imull	$0x15180, %eax, %r13d           ## imm = 0x15180
000000000142169f	movq	0x7d22c2(%rip), %rsi
00000000014216a6	movq	%r15, %rdi
00000000014216a9	callq	*%rbx
00000000014216ab	leaq	-0xa20(%r13), %r14
00000000014216b2	testb	%al, %al
00000000014216b4	cmoveq	%r13, %r14
00000000014216b8	movq	0x7d22a1(%rip), %rsi
00000000014216bf	movq	%r12, %rdi
00000000014216c2	callq	*%rbx
00000000014216c4	movq	%rax, %rcx
00000000014216c7	orq	%r14, %rcx
00000000014216ca	shrq	$0x20, %rcx
00000000014216ce	je	0x14216eb
00000000014216d0	cqto
00000000014216d2	idivq	%r14
00000000014216d5	jmp	0x14216f0
00000000014216d7	movq	0x7d228a(%rip), %rsi
00000000014216de	movq	0x7e27eb(%rip), %rax
00000000014216e5	movq	%rax, -0x30(%rbp)
00000000014216e9	jmp	0x142173a
00000000014216eb	xorl	%edx, %edx
00000000014216ed	divl	%r14d
00000000014216f0	movl	%edx, -0x60(%rbp)
00000000014216f3	leaq	-0x60(%rbp), %rdx
00000000014216f7	movl	$0x3, %esi
00000000014216fc	movq	-0x40(%rbp), %rdi
0000000001421700	callq	0x149480c                       ## symbol stub for: _CFNumberCreate
0000000001421705	testq	%rax, %rax
0000000001421708	je	0x1421728
000000000142170a	movq	%rax, %r12
000000000142170d	leaq	0x5907b4(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000001421714	movq	-0x38(%rbp), %rdi
0000000001421718	movq	%rax, %rdx
000000000142171b	callq	0x14947c4                       ## symbol stub for: _CFDictionarySetValue
0000000001421720	movq	%r12, %rdi
0000000001421723	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000001421728	movq	0x7e27a1(%rip), %rax
000000000142172f	movq	%rax, -0x30(%rbp)
0000000001421733	movq	0x7d222e(%rip), %rsi
000000000142173a	movq	0x4cbf7f(%rip), %rbx            ## Objc message: -[%rdi isEvent]
0000000001421741	movq	%r15, %rdi
0000000001421744	callq	*%rbx
0000000001421746	cmpb	$0x1, %al
0000000001421748	movl	$0xb, %r13d
000000000142174e	sbbl	$0x0, %r13d
0000000001421752	movq	0x7d21f7(%rip), %r12
0000000001421759	movq	%r15, %rdi
000000000142175c	movq	%r12, %rsi
000000000142175f	callq	*%rbx
0000000001421761	movq	%rax, %r14
0000000001421764	shrq	$0x20, %r14
0000000001421768	movq	%r15, %rdi
000000000142176b	movq	%r12, %rsi
000000000142176e	callq	*%rbx
0000000001421770	leaq	-0x60(%rbp), %rdi
0000000001421774	movq	%r14, %rsi
0000000001421777	movl	%eax, %edx
0000000001421779	callq	0x1495136                       ## symbol stub for: _CMTimeMake
000000000142177e	movq	%r15, %rdi
0000000001421781	movq	-0x30(%rbp), %rsi
0000000001421785	callq	*%rbx
0000000001421787	movzwl	%ax, %edx
000000000142178a	movq	-0x50(%rbp), %rax
000000000142178e	movq	%rax, 0x10(%rsp)
0000000001421793	movups	-0x60(%rbp), %xmm0
0000000001421797	movups	%xmm0, (%rsp)
000000000142179b	leaq	-0x48(%rbp), %r9
000000000142179f	movq	-0x40(%rbp), %rdi
00000000014217a3	movl	$0x746d6364, %esi               ## imm = 0x746D6364
00000000014217a8	movl	%r13d, %ecx
00000000014217ab	movq	-0x38(%rbp), %rbx
00000000014217af	movq	%rbx, %r8
00000000014217b2	callq	0x1495106                       ## symbol stub for: _CMTimeCodeFormatDescriptionCreate
00000000014217b7	testq	%rbx, %rbx
00000000014217ba	je	0x14217c4
00000000014217bc	movq	%rbx, %rdi
00000000014217bf	callq	0x149484e                       ## symbol stub for: _CFRelease
00000000014217c4	movq	-0x48(%rbp), %rax
00000000014217c8	addq	$0x58, %rsp
00000000014217cc	popq	%rbx
00000000014217cd	popq	%r12
00000000014217cf	popq	%r13
00000000014217d1	popq	%r14
00000000014217d3	popq	%r15
00000000014217d5	popq	%rbp
00000000014217d6	retq
00000000014217d7	nopw	(%rax,%rax)
