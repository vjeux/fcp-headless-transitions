__ZN30FFThreadLocalCountedSetSupport15ptrExistsForKeyEPK10__CFStringPKv:
00000000012fbbf0	pushq	%rbp
00000000012fbbf1	movq	%rsp, %rbp
00000000012fbbf4	pushq	%r14
00000000012fbbf6	pushq	%rbx
00000000012fbbf7	subq	$0x10, %rsp
00000000012fbbfb	movq	%rsi, %rbx
00000000012fbbfe	movq	%rdi, %r14
00000000012fbc01	leaq	-0x18(%rbp), %rdi
00000000012fbc05	callq	0x14965f4                       ## symbol stub for: __ZN17PCAutoreleasePoolC1Ev
00000000012fbc0a	movq	__ZL17sThreadStorageKey(%rip), %rdi ## sThreadStorageKey
00000000012fbc11	callq	0x1497ab8                       ## symbol stub for: _pthread_getspecific
00000000012fbc16	testq	%rax, %rax
00000000012fbc19	je	0x12fbc21
00000000012fbc1b	movq	0x8(%rax), %rdi
00000000012fbc1f	jmp	0x12fbc23
00000000012fbc21	xorl	%edi, %edi
00000000012fbc23	movq	0x8bd52e(%rip), %rsi
00000000012fbc2a	movq	%r14, %rdx
00000000012fbc2d	callq	*0x5f1a8d(%rip)                 ## Objc message: -[%rdi pointSize]
00000000012fbc33	testq	%rax, %rax
00000000012fbc36	je	0x12fbc4a
00000000012fbc38	movq	%rax, %rdi
00000000012fbc3b	movq	%rbx, %rsi
00000000012fbc3e	callq	0x14946ec                       ## symbol stub for: _CFBagContainsValue
00000000012fbc43	testb	%al, %al
00000000012fbc45	setne	%bl
00000000012fbc48	jmp	0x12fbc4c
00000000012fbc4a	xorl	%ebx, %ebx
00000000012fbc4c	leaq	-0x18(%rbp), %rdi
00000000012fbc50	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
00000000012fbc55	movl	%ebx, %eax
00000000012fbc57	addq	$0x10, %rsp
00000000012fbc5b	popq	%rbx
00000000012fbc5c	popq	%r14
00000000012fbc5e	popq	%rbp
00000000012fbc5f	retq
00000000012fbc60	jmp	0x12fbc62
00000000012fbc62	movq	%rax, %rbx
00000000012fbc65	leaq	-0x18(%rbp), %rdi
00000000012fbc69	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
00000000012fbc6e	movq	%rbx, %rdi
00000000012fbc71	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000012fbc76	nopw	%cs:(%rax,%rax)
