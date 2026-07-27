
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000169b6 <__ZN9OZChannel25setValueOffsetByBehaviorsERK6CMTimed>:
   169b6: 55                           	pushq	%rbp
   169b7: 48 89 e5                     	movq	%rsp, %rbp
   169ba: 41 57                        	pushq	%r15
   169bc: 41 56                        	pushq	%r14
   169be: 41 55                        	pushq	%r13
   169c0: 41 54                        	pushq	%r12
   169c2: 53                           	pushq	%rbx
   169c3: 48 83 ec 28                  	subq	$0x28, %rsp
   169c7: f2 0f 11 45 d0               	movsd	%xmm0, -0x30(%rbp)
   169cc: 48 89 f3                     	movq	%rsi, %rbx
   169cf: 49 89 fe                     	movq	%rdi, %r14
   169d2: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
   169d6: e8 73 f3 ff ff               	callq	0x15d4e <__ZNK9OZChannel16getValueAsDoubleERK6CMTimed>
   169db: f2 0f 10 4d d0               	movsd	-0x30(%rbp), %xmm1
   169e0: f2 0f 5c c8                  	subsd	%xmm0, %xmm1
   169e4: f2 0f 11 4d d0               	movsd	%xmm1, -0x30(%rbp)
   169e9: 49 8b 46 70                  	movq	0x70(%r14), %rax
   169ed: 4c 8b 78 08                  	movq	0x8(%rax), %r15
   169f1: 49 8b 06                     	movq	(%r14), %rax
   169f4: 4c 8d 65 b0                  	leaq	-0x50(%rbp), %r12
   169f8: 4c 89 e7                     	movq	%r12, %rdi
   169fb: 4c 89 f6                     	movq	%r14, %rsi
   169fe: 48 89 da                     	movq	%rbx, %rdx
   16a01: ff 90 48 01 00 00            	callq	*0x148(%rax)
   16a07: 49 8b 07                     	movq	(%r15), %rax
   16a0a: 4c 8d 6d c8                  	leaq	-0x38(%rbp), %r13
   16a0e: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
   16a12: 4c 89 ff                     	movq	%r15, %rdi
   16a15: 4c 89 e6                     	movq	%r12, %rsi
   16a18: 4c 89 ea                     	movq	%r13, %rdx
   16a1b: ff 90 70 02 00 00            	callq	*0x270(%rax)
   16a21: f2 0f 10 45 d0               	movsd	-0x30(%rbp), %xmm0
   16a26: f2 41 0f 58 45 00            	addsd	(%r13), %xmm0
   16a2c: 49 8b 06                     	movq	(%r14), %rax
   16a2f: 4c 89 f7                     	movq	%r14, %rdi
   16a32: 48 89 de                     	movq	%rbx, %rsi
   16a35: 31 d2                        	xorl	%edx, %edx
   16a37: ff 90 c8 02 00 00            	callq	*0x2c8(%rax)
   16a3d: 48 83 c4 28                  	addq	$0x28, %rsp
   16a41: 5b                           	popq	%rbx
   16a42: 41 5c                        	popq	%r12
   16a44: 41 5d                        	popq	%r13
   16a46: 41 5e                        	popq	%r14
   16a48: 41 5f                        	popq	%r15
   16a4a: 5d                           	popq	%rbp
   16a4b: c3                           	retq

0000000000016a4c <__ZN9OZChannel29setValueAndIgnoreRecordOptionERK6CMTime>:
   16a4c: 55                           	pushq	%rbp
   16a4d: 48 89 e5                     	movq	%rsp, %rbp
   16a50: 41 57                        	pushq	%r15
   16a52: 41 56                        	pushq	%r14
   16a54: 41 54                        	pushq	%r12
   16a56: 53                           	pushq	%rbx
   16a57: 48 83 ec 20                  	subq	$0x20, %rsp
   16a5b: 48 89 f3                     	movq	%rsi, %rbx
   16a5e: 49 89 fe                     	movq	%rdi, %r14
   16a61: 31 f6                        	xorl	%esi, %esi
   16a63: e8 0e 4f 03 00               	callq	0x4b976 <__ZNK13OZChannelBase8isLockedEb>
   16a68: 84 c0                        	testb	%al, %al
   16a6a: 75 74                        	jne	0x16ae0 <__ZN9OZChannel29setValueAndIgnoreRecordOptionERK6CMTime+0x94>
   16a6c: 49 8b 06                     	movq	(%r14), %rax
   16a6f: 4c 89 f7                     	movq	%r14, %rdi
   16a72: be 01 00 00 00               	movl	$0x1, %esi
   16a77: ff 90 d0 01 00 00            	callq	*0x1d0(%rax)
   16a7d: 49 8b 46 70                  	movq	0x70(%r14), %rax
   16a81: 80 78 20 01                  	cmpb	$0x1, 0x20(%rax)
   16a85: 75 0c                        	jne	0x16a93 <__ZN9OZChannel29setValueAndIgnoreRecordOptionERK6CMTime+0x47>
   16a87: 48 89 c7                     	movq	%rax, %rdi
   16a8a: e8 49 d7 ff ff               	callq	0x141d8 <__ZN13OZChannelImpl15createLocalCopyEv>
   16a8f: 49 89 46 70                  	movq	%rax, 0x70(%r14)
   16a93: 4c 8b 78 08                  	movq	0x8(%rax), %r15
   16a97: 49 8b 06                     	movq	(%r14), %rax
   16a9a: 4c 8d 65 c8                  	leaq	-0x38(%rbp), %r12
   16a9e: 4c 89 e7                     	movq	%r12, %rdi
   16aa1: 4c 89 f6                     	movq	%r14, %rsi
   16aa4: 48 89 da                     	movq	%rbx, %rdx
   16aa7: ff 90 48 01 00 00            	callq	*0x148(%rax)
   16aad: 49 8b 07                     	movq	(%r15), %rax
   16ab0: 4c 89 ff                     	movq	%r15, %rdi
   16ab3: 4c 89 e6                     	movq	%r12, %rsi
   16ab6: ba 01 00 00 00               	movl	$0x1, %edx
   16abb: ff 90 20 02 00 00            	callq	*0x220(%rax)
   16ac1: 49 8b 06                     	movq	(%r14), %rax
   16ac4: 4c 89 f7                     	movq	%r14, %rdi
   16ac7: ff 90 18 03 00 00            	callq	*0x318(%rax)
   16acd: 84 c0                        	testb	%al, %al
   16acf: 74 0f                        	je	0x16ae0 <__ZN9OZChannel29setValueAndIgnoreRecordOptionERK6CMTime+0x94>
   16ad1: 49 8b 06                     	movq	(%r14), %rax
   16ad4: 4c 89 f7                     	movq	%r14, %rdi
   16ad7: 48 89 de                     	movq	%rbx, %rsi
   16ada: ff 90 20 03 00 00            	callq	*0x320(%rax)
   16ae0: 48 83 c4 20                  	addq	$0x20, %rsp
   16ae4: 5b                           	popq	%rbx
   16ae5: 41 5c                        	popq	%r12
   16ae7: 41 5e                        	popq	%r14
   16ae9: 41 5f                        	popq	%r15
   16aeb: 5d                           	popq	%rbp
   16aec: c3                           	retq
   16aed: 90                           	nop

0000000000016aee <__ZN9OZChannel31setValueAndDontAddFirstKeypointERK6CMTimed>:
   16aee: 55                           	pushq	%rbp
   16aef: 48 89 e5                     	movq	%rsp, %rbp
   16af2: 41 57                        	pushq	%r15
   16af4: 41 56                        	pushq	%r14
   16af6: 41 54                        	pushq	%r12
   16af8: 53                           	pushq	%rbx
   16af9: 48 83 ec 20                  	subq	$0x20, %rsp
   16afd: f2 0f 11 45 d8               	movsd	%xmm0, -0x28(%rbp)
   16b02: 48 89 f3                     	movq	%rsi, %rbx
   16b05: 49 89 fe                     	movq	%rdi, %r14
   16b08: 31 f6                        	xorl	%esi, %esi
   16b0a: e8 67 4e 03 00               	callq	0x4b976 <__ZNK13OZChannelBase8isLockedEb>
   16b0f: 84 c0                        	testb	%al, %al
