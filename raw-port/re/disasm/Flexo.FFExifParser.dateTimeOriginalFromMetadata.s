+[FFExifParser dateTimeOriginalFromMetadata:]:
0000000000397700	pushq	%rbp
0000000000397701	movq	%rsp, %rbp
0000000000397704	pushq	%r15
0000000000397706	pushq	%r14
0000000000397708	pushq	%r13
000000000039770a	pushq	%r12
000000000039770c	pushq	%rbx
000000000039770d	pushq	%rax
000000000039770e	movq	%rdx, %r12
0000000000397711	movq	0x1821a40(%rip), %r15
0000000000397718	leaq	0x15b09e9(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
000000000039771f	movq	%r12, %rdi
0000000000397722	movq	%r15, %rsi
0000000000397725	callq	*0x1555f95(%rip)                ## Objc message: -[%rdi colorFolderPath]
000000000039772b	testq	%rax, %rax
000000000039772e	je	0x39781e
0000000000397734	movq	%rax, %rbx
0000000000397737	movq	0x1555e2a(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000039773e	callq	0x149798c                       ## symbol stub for: _objc_opt_class
0000000000397743	movq	%rbx, %rdi
0000000000397746	movq	%rax, %rsi
0000000000397749	callq	0x1497992                       ## symbol stub for: _objc_opt_isKindOfClass
000000000039774e	testb	%al, %al
0000000000397750	je	0x397822
0000000000397756	movq	0x1555c93(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_NSDateFormatter
000000000039775d	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000000397762	movq	%rax, %r14
0000000000397765	movq	0x182cbf4(%rip), %rsi
000000000039776c	leaq	0x15b09b5(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
0000000000397773	movq	0x1555f46(%rip), %r13           ## Objc message: -[%rdi colorFolderPath]
000000000039777a	movq	%rax, %rdi
000000000039777d	callq	*%r13
0000000000397780	leaq	0x15b09c1(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
0000000000397787	movq	%r12, %rdi
000000000039778a	movq	%r15, %rsi
000000000039778d	callq	*%r13
0000000000397790	testq	%rax, %rax
0000000000397793	je	0x3977fd
0000000000397795	movq	%rax, %r15
0000000000397798	movq	0x1555dc9(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000039779f	callq	0x149798c                       ## symbol stub for: _objc_opt_class
00000000003977a4	movq	%r15, %rdi
00000000003977a7	movq	%rax, %rsi
00000000003977aa	callq	0x1497992                       ## symbol stub for: _objc_opt_isKindOfClass
00000000003977af	testb	%al, %al
00000000003977b1	je	0x3977fd
00000000003977b3	leaq	_OBJC_CLASS_$_FFExifParser(%rip), %rdi
00000000003977ba	movq	0x18317bf(%rip), %rsi
00000000003977c1	movq	%r15, %rdx
00000000003977c4	callq	*0x1555ef6(%rip)                ## Objc message: -[%rdi colorFolderPath]
00000000003977ca	movabsq	$0x7fffffffffffffff, %rcx       ## imm = 0x7FFFFFFFFFFFFFFF
00000000003977d4	cmpq	%rcx, %rax
00000000003977d7	je	0x3977fd
00000000003977d9	movq	0x1557de0(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_NSTimeZone
00000000003977e0	movq	0x18317a1(%rip), %rsi
00000000003977e7	movq	%rax, %rdx
00000000003977ea	callq	*%r13
00000000003977ed	movq	0x183179c(%rip), %rsi
00000000003977f4	movq	%r14, %rdi
00000000003977f7	movq	%rax, %rdx
00000000003977fa	callq	*%r13
00000000003977fd	movq	0x182e784(%rip), %rsi
0000000000397804	movq	%r14, %rdi
0000000000397807	movq	%rbx, %rdx
000000000039780a	callq	*0x1555eb0(%rip)                ## Objc message: -[%rdi colorFolderPath]
0000000000397810	movq	%rax, %rbx
0000000000397813	movq	%r14, %rdi
0000000000397816	callq	*0x1555eec(%rip)                ## literal pool symbol address: _objc_release
000000000039781c	jmp	0x397841
000000000039781e	xorl	%ebx, %ebx
0000000000397820	jmp	0x397841
0000000000397822	movq	0x1557d17(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_NSDate
0000000000397829	callq	0x149798c                       ## symbol stub for: _objc_opt_class
000000000039782e	movq	%rbx, %rdi
0000000000397831	movq	%rax, %rsi
0000000000397834	callq	0x1497992                       ## symbol stub for: _objc_opt_isKindOfClass
0000000000397839	xorl	%ecx, %ecx
000000000039783b	testb	%al, %al
000000000039783d	cmoveq	%rcx, %rbx
0000000000397841	movq	%rbx, %rax
0000000000397844	addq	$0x8, %rsp
0000000000397848	popq	%rbx
0000000000397849	popq	%r12
000000000039784b	popq	%r13
000000000039784d	popq	%r14
000000000039784f	popq	%r15
0000000000397851	popq	%rbp
0000000000397852	retq
0000000000397853	nopw	%cs:(%rax,%rax)
