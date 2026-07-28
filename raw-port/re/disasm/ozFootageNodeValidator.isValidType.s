__ZN22ozFootageNodeValidator11isValidTypeER11OZSceneNode:
00000000005dcbe0	pushq	%rbp
00000000005dcbe1	movq	%rsp, %rbp
00000000005dcbe4	pushq	%r14
00000000005dcbe6	pushq	%rbx
00000000005dcbe7	movq	%rdi, %rbx
00000000005dcbea	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000005dcbf1	leaq	__ZTI15OZSceneNodeFile(%rip), %rdx ## typeinfo for OZSceneNodeFile
00000000005dcbf8	xorl	%r14d, %r14d
00000000005dcbfb	xorl	%ecx, %ecx
00000000005dcbfd	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000005dcc02	testq	%rax, %rax
00000000005dcc05	je	0x5dcc71
00000000005dcc07	movzbl	__ZGVZN22ozFootageNodeValidator15getSearchStringEvE13_searchString(%rip), %eax ## guard variable for ozFootageNodeValidator::getSearchString()::_searchString
00000000005dcc0e	testb	%al, %al
00000000005dcc10	je	0x5dcc79
00000000005dcc12	leaq	__ZZN22ozFootageNodeValidator15getSearchStringEvE13_searchString(%rip), %rdi ## ozFootageNodeValidator::getSearchString()::_searchString
00000000005dcc19	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
00000000005dcc1e	movb	$0x1, %r14b
00000000005dcc21	testb	%al, %al
00000000005dcc23	jne	0x5dcc71
00000000005dcc25	addq	$0x10, %rbx
00000000005dcc29	movq	%rbx, %rdi
00000000005dcc2c	callq	__ZNK19OZObjectManipulator7getNameEv ## OZObjectManipulator::getName() const
00000000005dcc31	movq	%rax, %rdi
00000000005dcc34	callq	0x6dfa44                        ## symbol stub for: __ZNK8PCString6ns_strEv
00000000005dcc39	movq	%rax, %rbx
00000000005dcc3c	leaq	__ZZN22ozFootageNodeValidator15getSearchStringEvE13_searchString(%rip), %rdi ## ozFootageNodeValidator::getSearchString()::_searchString
00000000005dcc43	callq	0x6dfa44                        ## symbol stub for: __ZNK8PCString6ns_strEv
00000000005dcc48	movq	0x3305a9(%rip), %rsi
00000000005dcc4f	movl	$0x1, %ecx
00000000005dcc54	movq	%rbx, %rdi
00000000005dcc57	movq	%rax, %rdx
00000000005dcc5a	callq	*0x2493c8(%rip)                 ## Objc message: -[%rdi identifiersForShortIdentifiers:]
00000000005dcc60	movabsq	$0x7fffffffffffffff, %rcx       ## imm = 0x7FFFFFFFFFFFFFFF
00000000005dcc6a	cmpq	%rcx, %rax
00000000005dcc6d	setne	%r14b
00000000005dcc71	movl	%r14d, %eax
00000000005dcc74	popq	%rbx
00000000005dcc75	popq	%r14
00000000005dcc77	popq	%rbp
00000000005dcc78	retq
00000000005dcc79	leaq	__ZGVZN22ozFootageNodeValidator15getSearchStringEvE13_searchString(%rip), %rdi ## guard variable for ozFootageNodeValidator::getSearchString()::_searchString
00000000005dcc80	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
00000000005dcc85	testl	%eax, %eax
00000000005dcc87	je	0x5dcc12
00000000005dcc89	leaq	__ZZN22ozFootageNodeValidator15getSearchStringEvE13_searchString(%rip), %rdi ## ozFootageNodeValidator::getSearchString()::_searchString
00000000005dcc90	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
00000000005dcc95	movq	0x24681c(%rip), %rdi            ## literal pool symbol address: __ZN8PCStringD1Ev
00000000005dcc9c	leaq	__ZZN22ozFootageNodeValidator15getSearchStringEvE13_searchString(%rip), %rsi ## ozFootageNodeValidator::getSearchString()::_searchString
00000000005dcca3	leaq	-0x5dccaa(%rip), %rdx
00000000005dccaa	callq	0x6dfcc6                        ## symbol stub for: ___cxa_atexit
00000000005dccaf	leaq	__ZGVZN22ozFootageNodeValidator15getSearchStringEvE13_searchString(%rip), %rdi ## guard variable for ozFootageNodeValidator::getSearchString()::_searchString
00000000005dccb6	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
00000000005dccbb	jmp	0x5dcc12
00000000005dccc0	movq	%rax, %rbx
00000000005dccc3	leaq	__ZGVZN22ozFootageNodeValidator15getSearchStringEvE13_searchString(%rip), %rdi ## guard variable for ozFootageNodeValidator::getSearchString()::_searchString
00000000005dccca	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
00000000005dcccf	movq	%rbx, %rdi
00000000005dccd2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000005dccd7	nopw	(%rax,%rax)
