__ZN13OZApplication13getCurrentDocEv:
000000000036a9a0	pushq	%rbp
000000000036a9a1	movq	%rsp, %rbp
000000000036a9a4	pushq	%rbx
000000000036a9a5	pushq	%rax
000000000036a9a6	movq	%rdi, %rbx
000000000036a9a9	movzbl	__ZGVZL17perThreadDocumentvE6result(%rip), %eax ## guard variable for perThreadDocument()::result
000000000036a9b0	testb	%al, %al
000000000036a9b2	je	0x36a9d7
000000000036a9b4	movq	__ZZL17perThreadDocumentvE6result(%rip), %rdi ## perThreadDocument()::result
000000000036a9bb	callq	0x6e00a4                        ## symbol stub for: _pthread_getspecific
000000000036a9c0	testq	%rax, %rax
000000000036a9c3	je	0x36a9cc
000000000036a9c5	addq	$0x8, %rsp
000000000036a9c9	popq	%rbx
000000000036a9ca	popq	%rbp
000000000036a9cb	retq
000000000036a9cc	movq	0x8(%rbx), %rax
000000000036a9d0	addq	$0x8, %rsp
000000000036a9d4	popq	%rbx
000000000036a9d5	popq	%rbp
000000000036a9d6	retq
000000000036a9d7	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036a9de	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
000000000036a9e3	testl	%eax, %eax
000000000036a9e5	je	0x36a9b4
000000000036a9e7	leaq	__ZZL17perThreadDocumentvE6result(%rip), %rdi ## perThreadDocument()::result
000000000036a9ee	leaq	__ZN16PCThreadSpecificI10OZDocumentE7destroyEPS0_(%rip), %rsi ## PCThreadSpecific<OZDocument>::destroy(OZDocument*)
000000000036a9f5	callq	0x6e00aa                        ## symbol stub for: _pthread_key_create
000000000036a9fa	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036aa01	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
000000000036aa06	jmp	0x36a9b4
000000000036aa08	movq	%rax, %rbx
000000000036aa0b	leaq	__ZGVZL17perThreadDocumentvE6result(%rip), %rdi ## guard variable for perThreadDocument()::result
000000000036aa12	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
000000000036aa17	movq	%rbx, %rdi
000000000036aa1a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000036aa1f	nop
