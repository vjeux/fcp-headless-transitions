__ZN13OZApplication13setCurrentDocEP10OZDocument:
000000000036aa20	pushq	%rbp
000000000036aa21	movq	%rsp, %rbp
000000000036aa24	pushq	%r14
000000000036aa26	pushq	%rbx
000000000036aa27	movq	%rsi, %rbx
000000000036aa2a	movq	%rdi, %r14
000000000036aa2d	movzbl	__ZGVZL17perThreadDocumentvE6result(%rip), %eax ## guard variable for perThreadDocument()::result
000000000036aa34	testb	%al, %al
000000000036aa36	je	0x36aa8b
000000000036aa38	movq	__ZZL17perThreadDocumentvE6result(%rip), %rdi ## perThreadDocument()::result
000000000036aa3f	callq	0x6e00a4                        ## symbol stub for: _pthread_getspecific
000000000036aa44	testq	%rax, %rax
000000000036aa47	sete	%cl
000000000036aa4a	cmpq	%rax, %rbx
000000000036aa4d	sete	%dl
000000000036aa50	orb	%cl, %dl
000000000036aa52	je	0x36aa5e
000000000036aa54	testq	%rax, %rax
000000000036aa57	je	0x36aa7c
000000000036aa59	popq	%rbx
000000000036aa5a	popq	%r14
000000000036aa5c	popq	%rbp
000000000036aa5d	retq
000000000036aa5e	movzbl	__ZGVZL17perThreadDocumentvE6result(%rip), %eax ## guard variable for perThreadDocument()::result
000000000036aa65	testb	%al, %al
000000000036aa67	je	0x36aabf
000000000036aa69	movq	__ZZL17perThreadDocumentvE6result(%rip), %rdi ## perThreadDocument()::result
000000000036aa70	movq	%rbx, %rsi
000000000036aa73	popq	%rbx
000000000036aa74	popq	%r14
000000000036aa76	popq	%rbp
000000000036aa77	jmp	0x6e00b6                        ## symbol stub for: _pthread_setspecific
000000000036aa7c	cmpq	0x8(%r14), %rbx
000000000036aa80	je	0x36aa59
000000000036aa82	movq	%rbx, 0x8(%r14)
000000000036aa86	popq	%rbx
000000000036aa87	popq	%r14
000000000036aa89	popq	%rbp
000000000036aa8a	retq
000000000036aa8b	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036aa92	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
000000000036aa97	testl	%eax, %eax
000000000036aa99	je	0x36aa38
000000000036aa9b	leaq	__ZZL17perThreadDocumentvE6result(%rip), %rdi ## perThreadDocument()::result
000000000036aaa2	leaq	__ZN16PCThreadSpecificI10OZDocumentE7destroyEPS0_(%rip), %rsi ## PCThreadSpecific<OZDocument>::destroy(OZDocument*)
000000000036aaa9	callq	0x6e00aa                        ## symbol stub for: _pthread_key_create
000000000036aaae	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036aab5	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
000000000036aaba	jmp	0x36aa38
000000000036aabf	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036aac6	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
000000000036aacb	testl	%eax, %eax
000000000036aacd	je	0x36aa69
000000000036aacf	leaq	__ZZL17perThreadDocumentvE6result(%rip), %rdi ## perThreadDocument()::result
000000000036aad6	leaq	__ZN16PCThreadSpecificI10OZDocumentE7destroyEPS0_(%rip), %rsi ## PCThreadSpecific<OZDocument>::destroy(OZDocument*)
000000000036aadd	callq	0x6e00aa                        ## symbol stub for: _pthread_key_create
000000000036aae2	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036aae9	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
000000000036aaee	jmp	0x36aa69
000000000036aaf3	jmp	0x36aaf5
000000000036aaf5	movq	%rax, %rbx
000000000036aaf8	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036aaff	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
000000000036ab04	movq	%rbx, %rdi
000000000036ab07	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000036ab0c	nopl	(%rax)
