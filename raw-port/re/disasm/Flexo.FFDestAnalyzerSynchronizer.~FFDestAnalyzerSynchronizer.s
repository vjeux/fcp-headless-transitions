__ZN26FFDestAnalyzerSynchronizerD0Ev:
000000000131ff70	pushq	%rbp
000000000131ff71	movq	%rsp, %rbp
000000000131ff74	pushq	%rbx
000000000131ff75	pushq	%rax
000000000131ff76	movq	%rdi, %rbx
000000000131ff79	leaq	0x606f80(%rip), %rax
000000000131ff80	movq	%rax, (%rdi)
000000000131ff83	movq	0x148(%rdi), %rdi
000000000131ff8a	callq	*0x5cd778(%rip)                 ## literal pool symbol address: _objc_release
000000000131ff90	leaq	0xa0(%rbx), %rdi
000000000131ff97	callq	__ZN16FFSynchronizableD1Ev      ## FFSynchronizable::~FFSynchronizable()
000000000131ff9c	leaq	0x10(%rbx), %rdi
000000000131ffa0	callq	__ZN16FFSynchronizableD1Ev      ## FFSynchronizable::~FFSynchronizable()
000000000131ffa5	movq	%rbx, %rdi
000000000131ffa8	addq	$0x8, %rsp
000000000131ffac	popq	%rbx
000000000131ffad	popq	%rbp
000000000131ffae	jmp	0x1497404                       ## symbol stub for: __ZdlPv
000000000131ffb3	movq	%rax, %rdi
000000000131ffb6	callq	___clang_call_terminate
000000000131ffbb	nopl	(%rax,%rax)
