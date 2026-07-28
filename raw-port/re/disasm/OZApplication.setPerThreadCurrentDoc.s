__ZN13OZApplication22setPerThreadCurrentDocEP10OZDocument:
000000000036ab10	pushq	%rbp
000000000036ab11	movq	%rsp, %rbp
000000000036ab14	pushq	%rbx
000000000036ab15	pushq	%rax
000000000036ab16	movq	%rsi, %rbx
000000000036ab19	movzbl	__ZGVZL17perThreadDocumentvE6result(%rip), %eax ## guard variable for perThreadDocument()::result
000000000036ab20	testb	%al, %al
000000000036ab22	je	0x36ab39
000000000036ab24	movq	__ZZL17perThreadDocumentvE6result(%rip), %rdi ## perThreadDocument()::result
000000000036ab2b	movq	%rbx, %rsi
000000000036ab2e	addq	$0x8, %rsp
000000000036ab32	popq	%rbx
000000000036ab33	popq	%rbp
000000000036ab34	jmp	0x6e00b6                        ## symbol stub for: _pthread_setspecific
000000000036ab39	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036ab40	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
000000000036ab45	testl	%eax, %eax
000000000036ab47	je	0x36ab24
000000000036ab49	leaq	__ZZL17perThreadDocumentvE6result(%rip), %rdi ## perThreadDocument()::result
000000000036ab50	leaq	__ZN16PCThreadSpecificI10OZDocumentE7destroyEPS0_(%rip), %rsi ## PCThreadSpecific<OZDocument>::destroy(OZDocument*)
000000000036ab57	callq	0x6e00aa                        ## symbol stub for: _pthread_key_create
000000000036ab5c	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036ab63	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
000000000036ab68	jmp	0x36ab24
000000000036ab6a	movq	%rax, %rbx
000000000036ab6d	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036ab74	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
000000000036ab79	movq	%rbx, %rdi
000000000036ab7c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000036ab81	nopw	%cs:(%rax,%rax)
